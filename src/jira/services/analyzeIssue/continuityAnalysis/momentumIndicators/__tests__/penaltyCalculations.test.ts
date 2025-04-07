import { calculateCoeffOfVariationPenalty } from '../calculateCoeffOfVariationPenalty'
import { calculateFrequencyPenalty } from '../calculateFrequencyPenalty'
import { calculateLongestPeriodPenalty } from '../calculateLongestPeriodPenalty'
import { calculateTotalDaysPenalty } from '../calculateTotalDaysPenalty'
import { calculateUpdateFrequencyPenalty } from '../calculateUpdateFrequencyPenalty'

describe('Momentum Indicators - Penalty Calculations', () => {
	describe('calculateCoeffOfVariationPenalty', () => {
		test('should return 5 for coefficient of variation > 2.0', () => {
			expect(calculateCoeffOfVariationPenalty(2.1)).toBe(5)
		})

		test('should return 4 for coefficient of variation > 1.5 and <= 2.0', () => {
			expect(calculateCoeffOfVariationPenalty(1.6)).toBe(4)
			expect(calculateCoeffOfVariationPenalty(2.0)).toBe(4)
		})

		test('should return 3 for coefficient of variation > 1.0 and <= 1.5', () => {
			expect(calculateCoeffOfVariationPenalty(1.1)).toBe(3)
			expect(calculateCoeffOfVariationPenalty(1.5)).toBe(3)
		})

		test('should return 2 for coefficient of variation > 0.75 and <= 1.0', () => {
			expect(calculateCoeffOfVariationPenalty(0.8)).toBe(2)
			expect(calculateCoeffOfVariationPenalty(1.0)).toBe(2)
		})

		test('should return 1 for coefficient of variation > 0.5 and <= 0.75', () => {
			expect(calculateCoeffOfVariationPenalty(0.6)).toBe(1)
			expect(calculateCoeffOfVariationPenalty(0.75)).toBe(1)
		})

		test('should return 0 for coefficient of variation <= 0.5', () => {
			expect(calculateCoeffOfVariationPenalty(0.5)).toBe(0)
			expect(calculateCoeffOfVariationPenalty(0.3)).toBe(0)
			expect(calculateCoeffOfVariationPenalty(0)).toBe(0)
		})
	})

	describe('calculateFrequencyPenalty', () => {
		test('should return 2 when period count is >= 4', () => {
			expect(calculateFrequencyPenalty(4)).toBe(2)
			expect(calculateFrequencyPenalty(6)).toBe(2)
		})

		test('should return 1 when period count is >= 2 and < 4', () => {
			expect(calculateFrequencyPenalty(2)).toBe(1)
			expect(calculateFrequencyPenalty(3)).toBe(1)
		})

		test('should return 0 when period count is < 2', () => {
			expect(calculateFrequencyPenalty(1)).toBe(0)
			expect(calculateFrequencyPenalty(0)).toBe(0)
		})
	})

	describe('calculateLongestPeriodPenalty', () => {
		test('should return 3 when longest stagnation days is > 15', () => {
			expect(calculateLongestPeriodPenalty(16)).toBe(3)
			expect(calculateLongestPeriodPenalty(20)).toBe(3)
		})

		test('should return 2 when longest stagnation days is > 10 and <= 15', () => {
			expect(calculateLongestPeriodPenalty(11)).toBe(2)
			expect(calculateLongestPeriodPenalty(15)).toBe(2)
		})

		test('should return 1 when longest stagnation days is > 7 and <= 10', () => {
			expect(calculateLongestPeriodPenalty(8)).toBe(1)
			expect(calculateLongestPeriodPenalty(10)).toBe(1)
		})

		test('should return 0 when longest stagnation days is <= 7', () => {
			expect(calculateLongestPeriodPenalty(7)).toBe(0)
			expect(calculateLongestPeriodPenalty(5)).toBe(0)
			expect(calculateLongestPeriodPenalty(0)).toBe(0)
		})
	})

	describe('calculateTotalDaysPenalty', () => {
		test('should return 5 when total stagnation days is > 30', () => {
			expect(calculateTotalDaysPenalty(31)).toBe(5)
			expect(calculateTotalDaysPenalty(40)).toBe(5)
		})

		test('should return 4 when total stagnation days is > 20 and <= 30', () => {
			expect(calculateTotalDaysPenalty(21)).toBe(4)
			expect(calculateTotalDaysPenalty(30)).toBe(4)
		})

		test('should return 3 when total stagnation days is > 15 and <= 20', () => {
			expect(calculateTotalDaysPenalty(16)).toBe(3)
			expect(calculateTotalDaysPenalty(20)).toBe(3)
		})

		test('should return 2 when total stagnation days is > 10 and <= 15', () => {
			expect(calculateTotalDaysPenalty(11)).toBe(2)
			expect(calculateTotalDaysPenalty(15)).toBe(2)
		})

		test('should return 1 when total stagnation days is > 5 and <= 10', () => {
			expect(calculateTotalDaysPenalty(6)).toBe(1)
			expect(calculateTotalDaysPenalty(10)).toBe(1)
		})

		test('should return 0 when total stagnation days is <= 5', () => {
			expect(calculateTotalDaysPenalty(5)).toBe(0)
			expect(calculateTotalDaysPenalty(3)).toBe(0)
			expect(calculateTotalDaysPenalty(0)).toBe(0)
		})
	})

	describe('calculateUpdateFrequencyPenalty', () => {
		test('should return 3 when updates per day < 0.1', () => {
			expect(calculateUpdateFrequencyPenalty(0.05)).toBe(3)
			expect(calculateUpdateFrequencyPenalty(0)).toBe(3)
		})

		test('should return 2 when updates per day >= 0.1 and < 0.2', () => {
			expect(calculateUpdateFrequencyPenalty(0.1)).toBe(2)
			expect(calculateUpdateFrequencyPenalty(0.15)).toBe(2)
		})

		test('should return 1 when updates per day >= 0.2 and < 0.3', () => {
			expect(calculateUpdateFrequencyPenalty(0.2)).toBe(1)
			expect(calculateUpdateFrequencyPenalty(0.25)).toBe(1)
		})

		test('should return 0 when updates per day >= 0.3', () => {
			expect(calculateUpdateFrequencyPenalty(0.3)).toBe(0)
			expect(calculateUpdateFrequencyPenalty(0.5)).toBe(0)
			expect(calculateUpdateFrequencyPenalty(1)).toBe(0)
		})
	})
})
