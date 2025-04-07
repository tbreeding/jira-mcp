import { calculateTimeBetween, calculateTimeToCompletion } from '../timeCalculation'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('timeCalculation', () => {
	describe('calculateTimeBetween', () => {
		test('should calculate time between two dates in milliseconds', () => {
			const startDate = new Date('2023-01-01T00:00:00.000Z')
			const endDate = new Date('2023-01-02T00:00:00.000Z')

			const result = calculateTimeBetween(startDate, endDate)

			// 24 hours = 86400000 milliseconds
			expect(result).toBe(86400000)
		})

		test('should return zero when dates are the same', () => {
			const date = new Date('2023-01-01T00:00:00.000Z')

			const result = calculateTimeBetween(date, date)

			expect(result).toBe(0)
		})

		test('should return negative value when end date is before start date', () => {
			const startDate = new Date('2023-01-02T00:00:00.000Z')
			const endDate = new Date('2023-01-01T00:00:00.000Z')

			const result = calculateTimeBetween(startDate, endDate)

			// -24 hours = -86400000 milliseconds
			expect(result).toBe(-86400000)
		})
	})

	describe('calculateTimeToCompletion', () => {
		test('should calculate time from date to resolution date', () => {
			// Mock issue with resolution date
			const mockIssue = {
				fields: {
					resolutiondate: '2023-01-15T00:00:00.000Z',
				},
			} as unknown as JiraIssue

			const fromDate = new Date('2023-01-10T00:00:00.000Z')

			const result = calculateTimeToCompletion(mockIssue, fromDate)

			// 5 days = 432000000 milliseconds
			expect(result).toBe(432000000)
		})

		test('should use current date when no resolution date is available', () => {
			// Mock issue with no resolution date
			const mockIssue = {
				fields: {},
			} as unknown as JiraIssue

			const fromDate = new Date('2023-01-01T00:00:00.000Z')
			const mockCurrentDate = new Date('2023-01-10T00:00:00.000Z')

			// Use fake timers to set current date
			jest.useFakeTimers()
			jest.setSystemTime(mockCurrentDate)

			try {
				const result = calculateTimeToCompletion(mockIssue, fromDate)

				// 9 days = 777600000 milliseconds
				expect(result).toBe(777600000)
			} finally {
				// Restore real timers
				jest.useRealTimers()
			}
		})

		test('should handle non-string resolution date', () => {
			// Mock issue with non-string resolution date (e.g. null)
			const mockIssue = {
				fields: {
					resolutiondate: null,
				},
			} as unknown as JiraIssue

			const fromDate = new Date('2023-01-01T00:00:00.000Z')
			const mockCurrentDate = new Date('2023-01-10T00:00:00.000Z')

			// Use fake timers to set current date
			jest.useFakeTimers()
			jest.setSystemTime(mockCurrentDate)

			try {
				const result = calculateTimeToCompletion(mockIssue, fromDate)

				// 9 days = 777600000 milliseconds
				expect(result).toBe(777600000)
			} finally {
				// Restore real timers
				jest.useRealTimers()
			}
		})
	})
})
