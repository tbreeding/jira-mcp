import { calculateTotalBlockedDays } from '../calculateTotalBlockedDays'
import type { BlockedPeriod } from '../types/durationAssessment.types'

// Mock the calculateBusinessDays function
jest.mock('../utils/dateUtils', () => ({
	calculateBusinessDays: jest.fn().mockImplementation(() => {
		// For testing purposes, return a simple difference of 2 days for any input
		return 2
	}),
}))

describe('calculateTotalBlockedDays', () => {
	it('should return 0 when no blocked periods are provided', () => {
		const blockedPeriods: BlockedPeriod[] = []
		const result = calculateTotalBlockedDays(blockedPeriods)
		expect(result).toBe(0)
	})

	it('should calculate total blocked days for completed periods', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: null,
			},
			{
				startTime: '2023-01-05T12:00:00.000Z',
				endTime: '2023-01-07T12:00:00.000Z',
				reason: null,
			},
		]

		// With our mock, each period contributes 2 days
		const result = calculateTotalBlockedDays(blockedPeriods)
		expect(result).toBe(4) // 2 periods × 2 days = 4 days
	})

	it('should use current date for periods without end time', () => {
		// Original implementation:
		// Mock Date.now to return a fixed timestamp
		const originalNow = Date.now
		Date.now = jest.fn(() => new Date('2023-01-10T12:00:00.000Z').getTime())

		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: null, // No end time, should use current date
				reason: null,
			},
		]

		const result = calculateTotalBlockedDays(blockedPeriods)
		expect(result).toBe(2) // Mock returns 2 days for any period

		// Restore original Date.now
		Date.now = originalNow
	})

	it('should sum days from multiple periods', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: null,
			},
			{
				startTime: '2023-01-05T12:00:00.000Z',
				endTime: '2023-01-07T12:00:00.000Z',
				reason: null,
			},
			{
				startTime: '2023-01-10T12:00:00.000Z',
				endTime: '2023-01-15T12:00:00.000Z',
				reason: null,
			},
		]

		// With our mock, each period contributes 2 days
		const result = calculateTotalBlockedDays(blockedPeriods)
		expect(result).toBe(6) // 3 periods × 2 days = 6 days
	})
})
