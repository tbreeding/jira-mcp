import { calculatePeriodStatistics } from '../periodStatistics'
import type { ActiveWorkPeriod } from '../../../types/continuityAnalysis.types'

describe('periodStatistics', () => {
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
			]

			const result = calculatePeriodStatistics(periods)

			expect(result.averagePeriodHours).toBe(4)
			expect(result.stdDev).toBe(0)
			expect(result.coeffOfVariation).toBe(0)
		})

		test('should handle zero average period hours', () => {
			const periods: ActiveWorkPeriod[] = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T10:00:00.000Z',
					durationHours: 0,
					status: 'In Progress',
					assignee: 'user1',
				},
			]

			const result = calculatePeriodStatistics(periods)

			expect(result.averagePeriodHours).toBe(0)
			expect(result.stdDev).toBe(0)
			expect(result.coeffOfVariation).toBe(0)
		})
	})
})
