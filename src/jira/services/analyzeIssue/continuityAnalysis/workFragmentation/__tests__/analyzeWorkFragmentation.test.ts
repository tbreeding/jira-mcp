import { analyzeWorkFragmentation } from '../analyzeWorkFragmentation'
import * as fragmentationScoringModule from '../fragmentationScoring'
import * as identifyActivePeriodsModule from '../identifyActivePeriods'
import type { JiraIssue } from '../../../../../types/issue.types'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../identifyActivePeriods')
jest.mock('../fragmentationScoring')

describe('analyzeWorkFragmentation', () => {
	// Setup mocks
	const mockIdentifyActiveWorkPeriods = jest.spyOn(identifyActivePeriodsModule, 'identifyActiveWorkPeriods')
	const mockCalculateFragmentationScore = jest.spyOn(fragmentationScoringModule, 'calculateFragmentationScore')

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should analyze work fragmentation with multiple periods', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
		} as unknown as JiraIssue

		const mockActivePeriods: ActiveWorkPeriod[] = [
			{
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-01-05T00:00:00.000Z',
				durationHours: 96, // 4 days = 96 hours
				status: 'In Progress',
				assignee: 'user1',
			},
			{
				startDate: '2023-01-10T00:00:00.000Z',
				endDate: '2023-01-15T00:00:00.000Z',
				durationHours: 120, // 5 days = 120 hours
				status: 'In Progress',
				assignee: 'user1',
			},
		]

		const mockFragmentationScore = 0.75

		// Set up mock returns
		mockIdentifyActiveWorkPeriods.mockReturnValue(mockActivePeriods)
		mockCalculateFragmentationScore.mockReturnValue(mockFragmentationScore)

		// Act
		const result = analyzeWorkFragmentation(issue)

		// Assert
		expect(result).toEqual({
			fragmentationScore: mockFragmentationScore,
			activeWorkPeriods: mockActivePeriods.length,
		})

		// Verify mock calls
		expect(mockIdentifyActiveWorkPeriods).toHaveBeenCalledWith(issue)
		expect(mockCalculateFragmentationScore).toHaveBeenCalledWith(mockActivePeriods)
	})

	test('should analyze work fragmentation with a single period', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
		} as unknown as JiraIssue

		const mockActivePeriods: ActiveWorkPeriod[] = [
			{
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-01-05T00:00:00.000Z',
				durationHours: 96, // 4 days = 96 hours
				status: 'In Progress',
				assignee: 'user1',
			},
		]

		const mockFragmentationScore = 0.0 // Perfect continuity

		// Set up mock returns
		mockIdentifyActiveWorkPeriods.mockReturnValue(mockActivePeriods)
		mockCalculateFragmentationScore.mockReturnValue(mockFragmentationScore)

		// Act
		const result = analyzeWorkFragmentation(issue)

		// Assert
		expect(result).toEqual({
			fragmentationScore: mockFragmentationScore,
			activeWorkPeriods: 1,
		})

		// Verify mock calls
		expect(mockIdentifyActiveWorkPeriods).toHaveBeenCalledWith(issue)
		expect(mockCalculateFragmentationScore).toHaveBeenCalledWith(mockActivePeriods)
	})

	test('should analyze work fragmentation with no periods', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
		} as unknown as JiraIssue

		const mockActivePeriods: ActiveWorkPeriod[] = []
		const mockFragmentationScore = 0.0 // Default for no periods

		// Set up mock returns
		mockIdentifyActiveWorkPeriods.mockReturnValue(mockActivePeriods)
		mockCalculateFragmentationScore.mockReturnValue(mockFragmentationScore)

		// Act
		const result = analyzeWorkFragmentation(issue)

		// Assert
		expect(result).toEqual({
			fragmentationScore: mockFragmentationScore,
			activeWorkPeriods: 0,
		})

		// Verify mock calls
		expect(mockIdentifyActiveWorkPeriods).toHaveBeenCalledWith(issue)
		expect(mockCalculateFragmentationScore).toHaveBeenCalledWith(mockActivePeriods)
	})
})
