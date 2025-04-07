import { calculateUpdateStatistics } from '../calculateUpdateStatistics'

describe('calculateUpdateStatistics', () => {
	test('should calculate coefficient of variation and updates per day', () => {
		const updateGaps = [2, 4, 6, 8] // Days between updates
		const updates = [1000, 2000, 3000, 4000, 5000] // Timestamps
		const totalDurationDays = 20

		const result = calculateUpdateStatistics(updateGaps, updates, totalDurationDays)

		// Expected values
		// Mean gap = (2 + 4 + 6 + 8) / 4 = 5
		// Variance = ((2-5)² + (4-5)² + (6-5)² + (8-5)²) / 4 = (9 + 1 + 1 + 9) / 4 = 5
		// Std Dev = √5 ≈ 2.236
		// Coeff of Variation = 2.236 / 5 ≈ 0.447
		// Updates per day = 5 / 20 = 0.25

		expect(result.coeffOfVariation).toBeCloseTo(0.447, 2)
		expect(result.updatesPerDay).toBe(0.25)
	})

	test('should handle empty update gaps', () => {
		const updateGaps: number[] = []
		const updates = [1000]
		const totalDurationDays = 10

		const result = calculateUpdateStatistics(updateGaps, updates, totalDurationDays)

		// When updateGaps is empty, mean will be NaN, and coeffOfVariation should be 0
		expect(result.coeffOfVariation).toBe(0)
		expect(result.updatesPerDay).toBe(0.1)
	})

	test('should handle when mean gap is 0', () => {
		const updateGaps = [0, 0, 0]
		const updates = [1000, 1000, 1000, 1000]
		const totalDurationDays = 5

		const result = calculateUpdateStatistics(updateGaps, updates, totalDurationDays)

		// When mean gap is 0, coeffOfVariation should be 0
		expect(result.coeffOfVariation).toBe(0)
		expect(result.updatesPerDay).toBe(0.8)
	})

	test('should calculate correctly with identical gaps', () => {
		const updateGaps = [3, 3, 3, 3]
		const updates = [1000, 2000, 3000, 4000, 5000]
		const totalDurationDays = 15

		const result = calculateUpdateStatistics(updateGaps, updates, totalDurationDays)

		// When all gaps are identical, stdDev should be 0, and coeffOfVariation should be 0
		expect(result.coeffOfVariation).toBe(0)
		expect(result.updatesPerDay).toBeCloseTo(0.33, 2)
	})

	test('should handle very high variance', () => {
		const updateGaps = [1, 50]
		const updates = [1000, 2000, 3000]
		const totalDurationDays = 51

		const result = calculateUpdateStatistics(updateGaps, updates, totalDurationDays)

		// Mean gap = (1 + 50) / 2 = 25.5
		// Variance = ((1-25.5)² + (50-25.5)²) / 2 = (600.25 + 600.25) / 2 = 600.25
		// Std Dev = √600.25 ≈ 24.5
		// Coeff of Variation = 24.5 / 25.5 ≈ 0.96

		expect(result.coeffOfVariation).toBeCloseTo(0.96, 2)
		expect(result.updatesPerDay).toBeCloseTo(0.059, 3)
	})
})
