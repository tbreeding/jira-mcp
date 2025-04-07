import { calculateFinalFragmentationScore } from '../fragmentationUtils'
import { calculateActiveRatio } from '../statistics/activeRatio'
import { calculatePeriodStatistics } from '../statistics/periodStatistics'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

describe('fragmentationUtils', () => {
	describe('calculatePeriodStatistics', () => {
		test('should return zeros for empty periods array', () => {
			const result = calculatePeriodStatistics([])

			expect(result).toEqual({
				averagePeriodHours: 0,
				stdDev: 0,
				coeffOfVariation: 0,
			})
		})

		test('should calculate correct statistics for a single period', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T14:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			const result = calculatePeriodStatistics(periods)

			expect(result.averagePeriodHours).toBe(4)
			expect(result.stdDev).toBe(0)
			expect(result.coeffOfVariation).toBe(0)
		})

		test('should calculate correct statistics for multiple periods of same duration', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T14:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-02T10:00:00.000Z',
					endDate: '2023-01-02T14:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-03T10:00:00.000Z',
					endDate: '2023-01-03T14:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			const result = calculatePeriodStatistics(periods)

			expect(result.averagePeriodHours).toBe(4)
			expect(result.stdDev).toBe(0)
			expect(result.coeffOfVariation).toBe(0)
		})

		test('should calculate correct statistics for periods with varying durations', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T14:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-02T10:00:00.000Z',
					endDate: '2023-01-02T18:00:00.000Z',
					durationHours: 8,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-03T10:00:00.000Z',
					endDate: '2023-01-03T12:00:00.000Z',
					durationHours: 2,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			const result = calculatePeriodStatistics(periods)

			// Average = (4 + 8 + 2) / 3 = 14 / 3 = 4.67
			expect(result.averagePeriodHours).toBeCloseTo(4.67, 2)

			// Variance = ((4-4.67)² + (8-4.67)² + (2-4.67)²) / 3 = (0.45 + 11.11 + 7.11) / 3 = 18.67 / 3 = 6.22
			// StdDev = √6.22 = 2.49
			expect(result.stdDev).toBeCloseTo(2.49, 2)

			// CoeffOfVariation = 2.49 / 4.67 = 0.53
			expect(result.coeffOfVariation).toBeCloseTo(0.53, 2)
		})

		// Test for line 38 - handling when averagePeriodHours is 0
		test('should handle zero average period hours', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T10:00:00.000Z',
					durationHours: 0,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-02T10:00:00.000Z',
					endDate: '2023-01-02T10:00:00.000Z',
					durationHours: 0,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			const result = calculatePeriodStatistics(periods)

			expect(result.averagePeriodHours).toBe(0)
			expect(result.stdDev).toBe(0)
			expect(result.coeffOfVariation).toBe(0) // Should be 0 when average is 0
		})
	})

	describe('calculateActiveRatio', () => {
		test('should return 0 for empty periods array', () => {
			const result = calculateActiveRatio([], 10)

			expect(result).toBe(0)
		})

		test('should return 0 if totalActiveHours is 0', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T14:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			const result = calculateActiveRatio(periods, 0)

			expect(result).toBe(0)
		})

		test('should calculate correct ratio when periods are contiguous', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T14:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-01T14:00:00.000Z',
					endDate: '2023-01-01T18:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			// Total active hours = 8
			// Total elapsed hours = 8 (from 10:00 to 18:00)
			// Ratio = 8/8 = 1
			const result = calculateActiveRatio(periods, 8)

			expect(result).toBe(1)
		})

		test('should calculate correct ratio when periods have gaps', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T12:00:00.000Z',
					durationHours: 2,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-01T14:00:00.000Z',
					endDate: '2023-01-01T16:00:00.000Z',
					durationHours: 2,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			// Total active hours = 4
			// Total elapsed hours = 6 (from 10:00 to 16:00)
			// Ratio = 4/6 = 0.67
			const result = calculateActiveRatio(periods, 4)

			expect(result).toBeCloseTo(0.67, 2)
		})

		test('should handle periods with different start and end dates', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T14:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-02T10:00:00.000Z',
					endDate: '2023-01-02T18:00:00.000Z',
					durationHours: 8,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			// Total active hours = 12
			// Total elapsed hours = 32 (from Jan 1 10:00 to Jan 2 18:00 = 32 hours)
			// Ratio = 12/32 = 0.375
			const result = calculateActiveRatio(periods, 12)

			expect(result).toBeCloseTo(0.375, 3)
		})

		// Test for line 67 - handling when totalElapsedHours is 0
		test('should handle case where start and end dates are identical', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T10:00:00.000Z', // Same timestamp
					durationHours: 0,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			// Even though totalActiveHours is not 0, elapsed time is 0
			// Should return 0 to avoid division by zero
			const result = calculateActiveRatio(periods, 1)

			expect(result).toBe(0)
		})
	})

	describe('calculateFinalFragmentationScore', () => {
		test('should return 100 for ideal values', () => {
			// Ideal values: 1 period, 100% active ratio, 0 variation
			const result = calculateFinalFragmentationScore(1, 1, 0)

			expect(result).toBe(100)
		})

		test('should apply penalty for multiple periods', () => {
			// 3 periods, 100% active ratio, 0 variation
			const result = calculateFinalFragmentationScore(3, 1, 0)

			// Base score = 100
			// Period penalty = 10 * (3 - 1) = 20
			// Active ratio penalty = 0
			// Uniformity penalty = 0
			// Final score = 100 - 20 = 80
			expect(result).toBe(80)
		})

		test('should apply penalty for low active ratio', () => {
			// 1 period, 50% active ratio, 0 variation
			const result = calculateFinalFragmentationScore(1, 0.5, 0)

			// Base score = 100
			// Period penalty = 0
			// Active ratio penalty = (1 - 0.5) * 40 = 20
			// Uniformity penalty = 0
			// Final score = 100 - 20 = 80
			expect(result).toBe(80)
		})

		test('should apply penalty for high coefficient of variation', () => {
			// 1 period, 100% active ratio, 0.5 variation
			const result = calculateFinalFragmentationScore(1, 1, 0.5)

			// Base score = 100
			// Period penalty = 0
			// Active ratio penalty = 0
			// Uniformity penalty = 0.5 * 30 = 15
			// Final score = 100 - 15 = 85
			expect(result).toBe(85)
		})

		test('should apply all penalties and bound score to minimum 0', () => {
			// Extreme case with high penalties
			const result = calculateFinalFragmentationScore(10, 0.1, 2.0)

			// Base score = 100
			// Period penalty = 10 * (10 - 1) = 90
			// Active ratio penalty = (1 - 0.1) * 40 = 36
			// Uniformity penalty = 2.0 * 30 = 60
			// Raw score = 100 - 90 - 36 - 60 = -86
			// After bounding = 0
			expect(result).toBe(0)
		})

		test('should apply all penalties and bound score to maximum 100', () => {
			// Edge case with negative penalties (shouldn't happen in practice)
			const result = calculateFinalFragmentationScore(-1, 2, -0.5)

			// This test is just ensuring the score stays bounded even with unusual inputs
			expect(result).toBeGreaterThanOrEqual(0)
			expect(result).toBeLessThanOrEqual(100)
		})
	})
})
