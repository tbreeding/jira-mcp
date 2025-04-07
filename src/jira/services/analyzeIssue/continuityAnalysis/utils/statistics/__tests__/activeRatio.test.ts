import { calculateActiveRatio } from '../activeRatio'
import type { ActiveWorkPeriod } from '../../../types/continuityAnalysis.types'

describe('activeRatio', () => {
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
})
