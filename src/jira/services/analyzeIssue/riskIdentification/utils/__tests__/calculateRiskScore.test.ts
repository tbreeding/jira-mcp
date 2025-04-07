import { DEFAULT_RISK_WEIGHTS } from '../../types/riskIdentification.types'
import { calculateRiskScore } from '../calculateRiskScore'

describe('calculateRiskScore', () => {
	test('calculates risk score with default weights', () => {
		const result = calculateRiskScore(5, 5, 5, 5, 5)

		// With all scores at 5 and default weights, result should be 5
		expect(result).toBe(5)
	})

	test('normalizes input scores that are too low', () => {
		const result = calculateRiskScore(-5, 0, 5, 5, 5)

		// The -5 and 0 should be normalized to 1
		const expected = Math.round(
			1 * DEFAULT_RISK_WEIGHTS.technical +
				1 * DEFAULT_RISK_WEIGHTS.dependency +
				5 * DEFAULT_RISK_WEIGHTS.timeline +
				5 * DEFAULT_RISK_WEIGHTS.knowledge +
				5 * DEFAULT_RISK_WEIGHTS.information,
		)

		expect(result).toBe(expected)
	})

	test('normalizes input scores that are too high', () => {
		const result = calculateRiskScore(15, 11, 5, 5, 5)

		// The 15 and 11 should be normalized to 10
		const expected = Math.round(
			10 * DEFAULT_RISK_WEIGHTS.technical +
				10 * DEFAULT_RISK_WEIGHTS.dependency +
				5 * DEFAULT_RISK_WEIGHTS.timeline +
				5 * DEFAULT_RISK_WEIGHTS.knowledge +
				5 * DEFAULT_RISK_WEIGHTS.information,
		)

		expect(result).toBe(expected)
	})

	test('handles custom weights', () => {
		const customWeights = {
			technical: 0.3,
			dependency: 0.2,
			timeline: 0.2,
			knowledge: 0.15,
			information: 0.15,
		}

		const result = calculateRiskScore(10, 5, 2, 8, 4, customWeights)

		// Calculate expected score using the custom weights
		const expected = Math.round(
			10 * customWeights.technical +
				5 * customWeights.dependency +
				2 * customWeights.timeline +
				8 * customWeights.knowledge +
				4 * customWeights.information,
		)

		expect(result).toBe(expected)
	})

	test('normalizes weights that do not sum to 1', () => {
		// Weights that don't add up to 1
		const customWeights = {
			technical: 3,
			dependency: 2,
			timeline: 2,
			knowledge: 1.5,
			information: 1.5,
		}

		// Total weight: 10

		const result = calculateRiskScore(10, 5, 2, 8, 4, customWeights)

		// Calculate expected score using normalized weights
		const totalWeight = 10 // 3 + 2 + 2 + 1.5 + 1.5
		const expected = Math.round(
			10 * (customWeights.technical / totalWeight) +
				5 * (customWeights.dependency / totalWeight) +
				2 * (customWeights.timeline / totalWeight) +
				8 * (customWeights.knowledge / totalWeight) +
				4 * (customWeights.information / totalWeight),
		)

		expect(result).toBe(expected)
	})

	test('accepts weights that already sum to 1', () => {
		// Weights that add up to exactly 1
		const customWeights = {
			technical: 0.2,
			dependency: 0.2,
			timeline: 0.2,
			knowledge: 0.2,
			information: 0.2,
		}

		const result = calculateRiskScore(10, 5, 2, 8, 4, customWeights)

		// Calculate expected score with the original weights
		const expected = Math.round(10 * 0.2 + 5 * 0.2 + 2 * 0.2 + 8 * 0.2 + 4 * 0.2)

		expect(result).toBe(expected)
	})

	test('handles weights with tiny deviation from sum of 1', () => {
		// Weights that add up to almost 1, but not quite due to floating point imprecision
		const customWeights = {
			technical: 0.2001,
			dependency: 0.2001,
			timeline: 0.1999,
			knowledge: 0.1999,
			information: 0.2,
		}
		// Sum is 1.0000000000000002 due to floating point imprecision

		const result = calculateRiskScore(10, 5, 2, 8, 4, customWeights)

		// Should treat these weights as already normalized
		const expected = Math.round(
			10 * customWeights.technical +
				5 * customWeights.dependency +
				2 * customWeights.timeline +
				8 * customWeights.knowledge +
				4 * customWeights.information,
		)

		expect(result).toBe(expected)
	})
})
