import * as changeIdentificationModule from '../changeIdentification'
import { identifyLateStageChanges } from '../identifyLateStageChanges'
import * as thresholdCalculationModule from '../thresholdCalculation'
import type { JiraIssue } from '../../../../../types/issue.types'
import type { LateStageChange } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../changeIdentification')
jest.mock('../thresholdCalculation')

describe('identifyLateStageChanges', () => {
	// Setup mocks
	const mockFindSignificantChangesAfter = jest.spyOn(changeIdentificationModule, 'findSignificantChangesAfter')
	const mockCalculateThresholdDate = jest.spyOn(thresholdCalculationModule, 'calculateThresholdDate')

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return empty array when issue has no changelog', () => {
		// Arrange
		const issueWithoutChangelog = {
			id: '12345',
			key: 'TEST-123',
		} as unknown as JiraIssue

		// Act
		const result = identifyLateStageChanges(issueWithoutChangelog)

		// Assert
		expect(result).toEqual([])
		expect(mockCalculateThresholdDate).not.toHaveBeenCalled()
		expect(mockFindSignificantChangesAfter).not.toHaveBeenCalled()
	})

	test('should return empty array when issue changelog histories is empty', () => {
		// Arrange
		const issueWithEmptyChangelog = {
			id: '12345',
			key: 'TEST-123',
			changelog: {
				histories: [],
			},
		} as unknown as JiraIssue

		// Act
		const result = identifyLateStageChanges(issueWithEmptyChangelog)

		// Assert
		expect(result).toEqual([])
		expect(mockCalculateThresholdDate).not.toHaveBeenCalled()
		expect(mockFindSignificantChangesAfter).not.toHaveBeenCalled()
	})

	test('should calculate threshold date and find significant changes', () => {
		// Arrange
		const issueWithChangelog = {
			id: '12345',
			key: 'TEST-123',
			changelog: {
				histories: [{ id: '1', created: '2023-01-01T00:00:00.000Z' }],
			},
		} as unknown as JiraIssue

		const mockThresholdDate = new Date('2023-01-15T00:00:00Z')
		const mockLateChanges: LateStageChange[] = [
			{
				date: '2023-01-20T00:00:00.000Z',
				field: 'status',
				description: 'Changed status from In Progress to Done',
				percentComplete: 0.85,
			},
		]

		mockCalculateThresholdDate.mockReturnValue(mockThresholdDate)
		mockFindSignificantChangesAfter.mockReturnValue(mockLateChanges)

		// Act
		const result = identifyLateStageChanges(issueWithChangelog)

		// Assert
		expect(result).toEqual(mockLateChanges)
		expect(mockCalculateThresholdDate).toHaveBeenCalledWith(issueWithChangelog, 0.7)
		expect(mockFindSignificantChangesAfter).toHaveBeenCalledWith(issueWithChangelog, mockThresholdDate)
	})

	test('should use custom late stage threshold', () => {
		// Arrange
		const issueWithChangelog = {
			id: '12345',
			key: 'TEST-123',
			changelog: {
				histories: [{ id: '1', created: '2023-01-01T00:00:00.000Z' }],
			},
		} as unknown as JiraIssue

		const customThreshold = 0.8
		const mockThresholdDate = new Date('2023-01-20T00:00:00Z')
		const mockLateChanges: LateStageChange[] = []

		mockCalculateThresholdDate.mockReturnValue(mockThresholdDate)
		mockFindSignificantChangesAfter.mockReturnValue(mockLateChanges)

		// Act
		const result = identifyLateStageChanges(issueWithChangelog, customThreshold)

		// Assert
		expect(result).toEqual(mockLateChanges)
		expect(mockCalculateThresholdDate).toHaveBeenCalledWith(issueWithChangelog, customThreshold)
		expect(mockFindSignificantChangesAfter).toHaveBeenCalledWith(issueWithChangelog, mockThresholdDate)
	})
})
