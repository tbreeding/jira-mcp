import * as changeDescriptionModule from '../changeDescription'
import { findSignificantChangesAfter } from '../changeIdentification'
import * as completionPercentageModule from '../completionPercentage'
import * as significantFieldsModule from '../significantFields'
import type { JiraIssue } from '../../../../../types/issue.types'

// Mock dependencies
jest.mock('../changeDescription')
jest.mock('../completionPercentage')
jest.mock('../significantFields')

describe('findSignificantChangesAfter', () => {
	// Setup mocks
	const mockGetChangeDescription = jest.spyOn(changeDescriptionModule, 'getChangeDescription')
	const mockCalculateCompletionPercentage = jest.spyOn(completionPercentageModule, 'calculateCompletionPercentage')
	const mockIsSignificantField = jest.spyOn(significantFieldsModule, 'isSignificantField')

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return empty array when no changelog histories exist after threshold date', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T00:00:00.000Z',
						items: [],
					},
				],
			},
		} as unknown as JiraIssue

		const thresholdDate = new Date('2023-01-02T00:00:00Z')

		// Act
		const result = findSignificantChangesAfter(issue, thresholdDate)

		// Assert
		expect(result).toEqual([])
		expect(mockIsSignificantField).not.toHaveBeenCalled()
	})

	test('should identify significant changes after threshold date', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			changelog: {
				histories: [
					// Before threshold - should be ignored
					{
						id: '1',
						created: '2023-01-01T00:00:00.000Z',
						items: [
							{ field: 'status', fieldtype: 'jira', from: '1', fromString: 'To Do', to: '2', toString: 'In Progress' },
						],
					},
					// After threshold - should be included if field is significant
					{
						id: '2',
						created: '2023-01-15T00:00:00.000Z',
						items: [
							{ field: 'status', fieldtype: 'jira', from: '2', fromString: 'In Progress', to: '3', toString: 'Done' },
							{
								field: 'non-significant',
								fieldtype: 'jira',
								from: 'old',
								fromString: 'Old Value',
								to: 'new',
								toString: 'New Value',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		const thresholdDate = new Date('2023-01-10T00:00:00Z')
		const mockChangeDescription = 'Changed status from In Progress to Done'
		const mockCompletionPercentage = 0.85

		// Setup mock returns
		mockIsSignificantField.mockImplementation((field) => field === 'status')
		mockGetChangeDescription.mockReturnValue(mockChangeDescription)
		mockCalculateCompletionPercentage.mockReturnValue(mockCompletionPercentage)

		// Act
		const result = findSignificantChangesAfter(issue, thresholdDate)

		// Assert
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({
			date: '2023-01-15T00:00:00.000Z',
			field: 'status',
			description: mockChangeDescription,
			percentComplete: mockCompletionPercentage,
		})

		// Verify mock calls
		expect(mockIsSignificantField).toHaveBeenCalledTimes(2)
		expect(mockIsSignificantField).toHaveBeenCalledWith('status')
		expect(mockIsSignificantField).toHaveBeenCalledWith('non-significant')

		expect(mockGetChangeDescription).toHaveBeenCalledTimes(1)
		expect(mockGetChangeDescription).toHaveBeenCalledWith(issue.changelog.histories[1].items[0])

		expect(mockCalculateCompletionPercentage).toHaveBeenCalledTimes(1)
		expect(mockCalculateCompletionPercentage).toHaveBeenCalledWith(issue, '2023-01-15T00:00:00.000Z')
	})

	test('should handle multiple significant changes in multiple history entries', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			changelog: {
				histories: [
					// After threshold - first change
					{
						id: '1',
						created: '2023-01-15T00:00:00.000Z',
						items: [
							{ field: 'status', fieldtype: 'jira', from: '1', fromString: 'To Do', to: '2', toString: 'In Progress' },
						],
					},
					// After threshold - second change
					{
						id: '2',
						created: '2023-01-20T00:00:00.000Z',
						items: [
							{
								field: 'priority',
								fieldtype: 'jira',
								from: 'medium',
								fromString: 'Medium',
								to: 'high',
								toString: 'High',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		const thresholdDate = new Date('2023-01-10T00:00:00Z')

		// Setup mock returns
		mockIsSignificantField.mockReturnValue(true)
		mockGetChangeDescription.mockImplementation((item) => {
			if (item.field === 'status') return 'Changed status from To Do to In Progress'
			if (item.field === 'priority') return 'Changed priority from Medium to High'
			return ''
		})
		mockCalculateCompletionPercentage.mockImplementation((_, date) => {
			if (date === '2023-01-15T00:00:00.000Z') return 0.7
			if (date === '2023-01-20T00:00:00.000Z') return 0.8
			return 0
		})

		// Act
		const result = findSignificantChangesAfter(issue, thresholdDate)

		// Assert
		expect(result).toHaveLength(2)
		expect(result).toEqual([
			{
				date: '2023-01-15T00:00:00.000Z',
				field: 'status',
				description: 'Changed status from To Do to In Progress',
				percentComplete: 0.7,
			},
			{
				date: '2023-01-20T00:00:00.000Z',
				field: 'priority',
				description: 'Changed priority from Medium to High',
				percentComplete: 0.8,
			},
		])
	})
})
