import { calculateFinalFragmentationScore } from '../../utils/fragmentationUtils'
import { calculateActiveRatio } from '../../utils/statistics/activeRatio'
import { calculateTotalActiveHours } from '../../utils/statistics/calculateTotalActiveHours'
import { calculatePeriodStatistics } from '../../utils/statistics/periodStatistics'
import { calculateFragmentationScore } from '../fragmentationScoring'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../../utils/fragmentationUtils')
jest.mock('../../utils/statistics/activeRatio')
jest.mock('../../utils/statistics/calculateTotalActiveHours')
jest.mock('../../utils/statistics/periodStatistics')

// Create cast mock variables
const mockCalculatePeriodStatistics = calculatePeriodStatistics as jest.Mock
const mockCalculateActiveRatio = calculateActiveRatio as jest.Mock
const mockCalculateFinalFragmentationScore = calculateFinalFragmentationScore as jest.Mock
const mockCalculateTotalActiveHours = calculateTotalActiveHours as jest.Mock

describe('calculateFragmentationScore', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return 100 for no active periods', () => {
		// Arrange
		const activeWorkPeriods: ActiveWorkPeriod[] = []

		// Act
		const result = calculateFragmentationScore(activeWorkPeriods)

		// Assert
		expect(result).toBe(100)
		expect(mockCalculateTotalActiveHours).not.toHaveBeenCalled()
		expect(mockCalculatePeriodStatistics).not.toHaveBeenCalled()
		expect(mockCalculateActiveRatio).not.toHaveBeenCalled()
		expect(mockCalculateFinalFragmentationScore).not.toHaveBeenCalled()
	})

	test('should calculate fragmentation score for single period', () => {
		// Arrange
		const activeWorkPeriods: ActiveWorkPeriod[] = [
			{
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-01-05T00:00:00.000Z',
				durationHours: 96,
				status: 'In Progress',
				assignee: 'user1',
			},
		]

		const totalActiveHours = 96
		const periodStats = {
			averagePeriodHours: 96,
			stdDev: 0,
			coeffOfVariation: 0,
		}
		const activeRatio = 1.0
		const finalScore = 0.0 // Meaning no fragmentation

		// Set up mock returns
		mockCalculateTotalActiveHours.mockReturnValue(totalActiveHours)
		mockCalculatePeriodStatistics.mockReturnValue(periodStats)
		mockCalculateActiveRatio.mockReturnValue(activeRatio)
		mockCalculateFinalFragmentationScore.mockReturnValue(finalScore)

		// Act
		const result = calculateFragmentationScore(activeWorkPeriods)

		// Assert
		expect(result).toBe(finalScore)
		expect(mockCalculateTotalActiveHours).toHaveBeenCalledWith(activeWorkPeriods)
		expect(mockCalculatePeriodStatistics).toHaveBeenCalledWith(activeWorkPeriods)
		expect(mockCalculateActiveRatio).toHaveBeenCalledWith(activeWorkPeriods, totalActiveHours)
		expect(mockCalculateFinalFragmentationScore).toHaveBeenCalledWith(
			activeWorkPeriods.length,
			activeRatio,
			periodStats.coeffOfVariation,
		)
	})

	test('should calculate fragmentation score for multiple periods', () => {
		// Arrange
		const activeWorkPeriods: ActiveWorkPeriod[] = [
			{
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-01-03T00:00:00.000Z',
				durationHours: 48,
				status: 'In Progress',
				assignee: 'user1',
			},
			{
				startDate: '2023-01-10T00:00:00.000Z',
				endDate: '2023-01-15T00:00:00.000Z',
				durationHours: 120,
				status: 'In Progress',
				assignee: 'user1',
			},
		]

		const totalActiveHours = 168 // 48 + 120
		const periodStats = {
			averagePeriodHours: 84,
			stdDev: 36,
			coeffOfVariation: 0.42,
		}
		const activeRatio = 0.6
		const finalScore = 0.55 // Moderate fragmentation

		// Set up mock returns
		mockCalculateTotalActiveHours.mockReturnValue(totalActiveHours)
		mockCalculatePeriodStatistics.mockReturnValue(periodStats)
		mockCalculateActiveRatio.mockReturnValue(activeRatio)
		mockCalculateFinalFragmentationScore.mockReturnValue(finalScore)

		// Act
		const result = calculateFragmentationScore(activeWorkPeriods)

		// Assert
		expect(result).toBe(finalScore)
		expect(mockCalculateTotalActiveHours).toHaveBeenCalledWith(activeWorkPeriods)
		expect(mockCalculatePeriodStatistics).toHaveBeenCalledWith(activeWorkPeriods)
		expect(mockCalculateActiveRatio).toHaveBeenCalledWith(activeWorkPeriods, totalActiveHours)
		expect(mockCalculateFinalFragmentationScore).toHaveBeenCalledWith(
			activeWorkPeriods.length,
			activeRatio,
			periodStats.coeffOfVariation,
		)
	})
})
