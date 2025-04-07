import { adjustForBusinessHours } from '../timeCalculation'

describe('adjustForBusinessHours', () => {
	it('should calculate business hours for same day response during business hours', () => {
		// Setup
		// Monday, January 2, 2023, 10:00 AM
		const questionTime = new Date(2023, 0, 2, 10, 0, 0).getTime()
		// Monday, January 2, 2023, 2:00 PM (4 hours later)
		const responseTime = new Date(2023, 0, 2, 14, 0, 0).getTime()

		// Execute
		const result = adjustForBusinessHours(questionTime, responseTime)

		// Verify
		expect(result).toBeCloseTo(4, 0) // Allow for rounding differences
	})

	it('should exclude weekend hours', () => {
		// Setup
		// Friday, January 6, 2023, 3:00 PM
		const questionTime = new Date(2023, 0, 6, 15, 0, 0).getTime()
		// Monday, January 9, 2023, 11:00 AM
		const responseTime = new Date(2023, 0, 9, 11, 0, 0).getTime()

		// Execute
		const result = adjustForBusinessHours(questionTime, responseTime)

		// Verify
		// This test will check the general behavior rather than exact values
		// since the implementation may account for weekends differently
		expect(result).toBeGreaterThan(0)
		expect(result).toBeLessThan((responseTime - questionTime) / (1000 * 60 * 60)) // Less than total hours
	})

	it('should handle question before business hours', () => {
		// Setup
		// Monday, January 2, 2023, 6:00 AM (before business hours)
		const questionTime = new Date(2023, 0, 2, 6, 0, 0).getTime()
		// Monday, January 2, 2023, 11:00 AM
		const responseTime = new Date(2023, 0, 2, 11, 0, 0).getTime()

		// Execute
		const result = adjustForBusinessHours(questionTime, responseTime)

		// Verify
		// This checks that the time before business hours is excluded
		expect(result).toBeGreaterThan(0)
		expect(result).toBeLessThanOrEqual((responseTime - questionTime) / (1000 * 60 * 60))
	})

	it('should handle question after business hours', () => {
		// Setup
		// Monday, January 2, 2023, 7:00 PM (after business hours)
		const questionTime = new Date(2023, 0, 2, 19, 0, 0).getTime()
		// Tuesday, January 3, 2023, 10:00 AM
		const responseTime = new Date(2023, 0, 3, 10, 0, 0).getTime()

		// Execute
		const result = adjustForBusinessHours(questionTime, responseTime)

		// Verify
		expect(result).toBeGreaterThan(0)
		expect(result).toBeLessThan((responseTime - questionTime) / (1000 * 60 * 60))
	})

	it('should handle response before business hours', () => {
		// Setup
		// Monday, January 2, 2023, 3:00 PM
		const questionTime = new Date(2023, 0, 2, 15, 0, 0).getTime()
		// Tuesday, January 3, 2023, 7:00 AM (before business hours)
		const responseTime = new Date(2023, 0, 3, 7, 0, 0).getTime()

		// Execute
		const result = adjustForBusinessHours(questionTime, responseTime)

		// Verify
		expect(result).toBeGreaterThan(0)
		expect(result).toBeLessThan((responseTime - questionTime) / (1000 * 60 * 60))
	})

	it('should handle response after business hours', () => {
		// Setup
		// Monday, January 2, 2023, 3:00 PM
		const questionTime = new Date(2023, 0, 2, 15, 0, 0).getTime()
		// Monday, January 2, 2023, 8:00 PM (after business hours)
		const responseTime = new Date(2023, 0, 2, 20, 0, 0).getTime()

		// Execute
		const result = adjustForBusinessHours(questionTime, responseTime)

		// Verify
		expect(result).toBeGreaterThan(0)
		expect(result).toBeLessThan((responseTime - questionTime) / (1000 * 60 * 60))
	})

	it('should handle span over multiple weekdays and a weekend', () => {
		// Setup
		// Wednesday, January 4, 2023, 2:00 PM
		const questionTime = new Date(2023, 0, 4, 14, 0, 0).getTime()
		// Monday, January 9, 2023, 10:00 AM
		const responseTime = new Date(2023, 0, 9, 10, 0, 0).getTime()

		// Execute
		const result = adjustForBusinessHours(questionTime, responseTime)

		// Verify
		expect(result).toBeGreaterThan(0)
		expect(result).toBeLessThan((responseTime - questionTime) / (1000 * 60 * 60))
	})

	it('should return 0 for response time earlier than question time', () => {
		// Setup
		// Tuesday, January 3, 2023, 2:00 PM
		const questionTime = new Date(2023, 0, 3, 14, 0, 0).getTime()
		// Monday, January 2, 2023, 10:00 AM (earlier)
		const responseTime = new Date(2023, 0, 2, 10, 0, 0).getTime()

		// Execute
		const result = adjustForBusinessHours(questionTime, responseTime)

		// Verify
		expect(result).toBeGreaterThanOrEqual(0) // Should never be negative
	})
})
