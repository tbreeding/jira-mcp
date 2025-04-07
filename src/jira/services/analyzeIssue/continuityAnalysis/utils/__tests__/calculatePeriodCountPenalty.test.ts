import { calculatePeriodCountPenalty } from '../calculatePeriodCountPenalty'

describe('calculatePeriodCountPenalty', () => {
	test('should return 0 for 0 or 1 period', () => {
		expect(calculatePeriodCountPenalty(0)).toBe(0)
		expect(calculatePeriodCountPenalty(1)).toBe(0)
	})

	test('should return 10 * (n-1) for 2-3 periods', () => {
		expect(calculatePeriodCountPenalty(2)).toBe(10)
		expect(calculatePeriodCountPenalty(3)).toBe(20)
	})

	test('should return 20 + 15 * (n-3) for 4-5 periods', () => {
		expect(calculatePeriodCountPenalty(4)).toBe(35)
		expect(calculatePeriodCountPenalty(5)).toBe(50)
	})

	test('should return 50 + 10 * min(5, n-5) for 6+ periods', () => {
		// The line that's not covered is the branch where periodCount > 5
		expect(calculatePeriodCountPenalty(6)).toBe(60)
		expect(calculatePeriodCountPenalty(7)).toBe(70)
		expect(calculatePeriodCountPenalty(10)).toBe(100)
		expect(calculatePeriodCountPenalty(20)).toBe(100) // Should max out at periodCount = 10
	})
})
