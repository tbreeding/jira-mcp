/**
 * Tests for detectRiskIndicators utility
 *
 * This file contains tests for the detectRiskIndicators function, which
 * identifies patterns in text that indicate potential risks.
 */

import { detectRiskIndicators } from '../utils/detectRiskIndicators'

describe('detectRiskIndicators', () => {
	test('returns empty result for empty text', () => {
		const result = detectRiskIndicators('', ['pattern1', 'pattern2'], 'TestCategory')

		expect(result.present).toBe(false)
		expect(result.indicators).toHaveLength(0)
		expect(result.severity).toBe('low')
	})

	test('returns empty result for null text', () => {
		const result = detectRiskIndicators(null as unknown as string, ['pattern1', 'pattern2'], 'TestCategory')

		expect(result.present).toBe(false)
		expect(result.indicators).toHaveLength(0)
		expect(result.severity).toBe('low')
	})

	test('returns empty result for undefined text', () => {
		const result = detectRiskIndicators(undefined as unknown as string, ['pattern1', 'pattern2'], 'TestCategory')

		expect(result.present).toBe(false)
		expect(result.indicators).toHaveLength(0)
		expect(result.severity).toBe('low')
	})

	test('returns empty result for empty patterns', () => {
		const result = detectRiskIndicators('This is a test text', [], 'TestCategory')

		expect(result.present).toBe(false)
		expect(result.indicators).toHaveLength(0)
		expect(result.severity).toBe('low')
	})

	test('handles various falsy values for text parameter', () => {
		// Test with a non-empty but falsy value like 0 or false converted to string
		const resultWithFalse = detectRiskIndicators(false as unknown as string, ['pattern1'], 'TestCategory')
		const resultWithZero = detectRiskIndicators(0 as unknown as string, ['pattern1'], 'TestCategory')

		expect(resultWithFalse.present).toBe(false)
		expect(resultWithFalse.indicators).toHaveLength(0)
		expect(resultWithFalse.severity).toBe('low')

		expect(resultWithZero.present).toBe(false)
		expect(resultWithZero.indicators).toHaveLength(0)
		expect(resultWithZero.severity).toBe('low')
	})

	test('handles non-string input values correctly', () => {
		// Test with a variety of non-string inputs
		const testCases = [
			{ input: {}, patterns: ['test'], description: 'Object' },
			{ input: [], patterns: ['test'], description: 'Empty array' },
			{ input: [1, 2, 3], patterns: ['test'], description: 'Array with values' },
			{ input: new Date(), patterns: ['test'], description: 'Date object' },
			{ input: /regex/, patterns: ['test'], description: 'RegExp object' },
			{ input: NaN, patterns: ['test'], description: 'NaN' },
			{ input: Infinity, patterns: ['test'], description: 'Infinity' },
			{ input: -Infinity, patterns: ['test'], description: 'Negative Infinity' },
			{ input: Symbol('test'), patterns: ['test'], description: 'Symbol' },
			{ input: new Map(), patterns: ['test'], description: 'Map object' },
			{ input: new Set(), patterns: ['test'], description: 'Set object' },
			{ input: function () {}, patterns: ['test'], description: 'Function' },
			{ input: BigInt(123), patterns: ['test'], description: 'BigInt' },
		]

		testCases.forEach((testCase) => {
			const result = detectRiskIndicators(testCase.input as unknown as string, testCase.patterns, 'TestCategory')

			// All non-string inputs should not crash and return default values
			expect(result.present).toBe(false)
			expect(result.indicators).toHaveLength(0)
			expect(result.severity).toBe('low')
		})
	})

	test('handles empty or invalid patterns correctly', () => {
		// Test with valid text but different invalid pattern types
		const invalidPatterns = [
			{ patterns: null as unknown as Array<string | RegExp>, description: 'Null patterns' },
			{ patterns: undefined as unknown as Array<string | RegExp>, description: 'Undefined patterns' },
			{ patterns: {} as unknown as Array<string | RegExp>, description: 'Object instead of array' },
			{ patterns: 'string' as unknown as Array<string | RegExp>, description: 'String instead of array' },
			{ patterns: 123 as unknown as Array<string | RegExp>, description: 'Number instead of array' },
		]

		invalidPatterns.forEach((testCase) => {
			const result = detectRiskIndicators('Valid text', testCase.patterns, 'TestCategory')

			// All invalid pattern inputs should not crash and return default values
			expect(result.present).toBe(false)
			expect(result.indicators).toHaveLength(0)
			expect(result.severity).toBe('low')
		})
	})

	test('detects string patterns with correct category label', () => {
		const text = 'This text contains a risk pattern that we want to detect'
		const patterns = ['risk pattern', 'another pattern']
		const category = 'RiskCategory'

		const result = detectRiskIndicators(text, patterns, category)

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(1)
		expect(result.indicators[0]).toContain('RiskCategory')
		expect(result.indicators[0]).toContain('risk pattern')
		expect(result.severity).toBe('low')
	})

	test('detects regex patterns', () => {
		const text = 'This should match pattern123 in the text'
		const patterns = [/pattern\d+/i]
		const category = 'RegexCategory'

		const result = detectRiskIndicators(text, patterns, category)

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(1)
		expect(result.indicators[0]).toContain('RegexCategory')
		expect(result.indicators[0]).toContain('pattern\\d+')
	})

	test('handles case insensitivity correctly', () => {
		const text = 'This text contains UPPERCASE pattern'
		const patterns = ['uppercase pattern']

		const result = detectRiskIndicators(text, patterns, 'TestCategory')

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(1)
	})

	test('assigns medium severity for 3-5 indicators', () => {
		const text = 'pattern1 pattern2 pattern3 pattern4 pattern5'
		const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4', 'pattern5']

		const result = detectRiskIndicators(text, patterns, 'TestCategory')

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(5)
		expect(result.severity).toBe('medium')
	})

	test('assigns low severity for exactly 1 indicator', () => {
		const text = 'pattern1'
		const patterns = ['pattern1']

		const result = detectRiskIndicators(text, patterns, 'TestCategory')

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(1)
		expect(result.severity).toBe('low')
	})

	test('assigns low severity for exactly 2 indicators', () => {
		const text = 'pattern1 pattern2'
		const patterns = ['pattern1', 'pattern2']

		const result = detectRiskIndicators(text, patterns, 'TestCategory')

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(2)
		expect(result.severity).toBe('low')
	})

	test('assigns medium severity for exactly 3 indicators', () => {
		const text = 'pattern1 pattern2 pattern3'
		const patterns = ['pattern1', 'pattern2', 'pattern3']

		const result = detectRiskIndicators(text, patterns, 'TestCategory')

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(3)
		expect(result.severity).toBe('medium')
	})

	test('assigns high severity for more than 5 indicators', () => {
		const text = 'pattern1 pattern2 pattern3 pattern4 pattern5 pattern6 pattern7'
		const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4', 'pattern5', 'pattern6', 'pattern7']

		const result = detectRiskIndicators(text, patterns, 'TestCategory')

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(7)
		expect(result.severity).toBe('high')
	})

	test('detects multiple occurrences of the same pattern only once', () => {
		const text = 'pattern pattern pattern'
		const patterns = ['pattern']

		const result = detectRiskIndicators(text, patterns, 'TestCategory')

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(1)
	})

	test('handles mix of string and regex patterns', () => {
		const text = 'This contains a string pattern and also pattern123'
		const patterns = ['string pattern', /pattern\d+/]

		const result = detectRiskIndicators(text, patterns, 'MixedCategory')

		expect(result.present).toBe(true)
		expect(result.indicators).toHaveLength(2)
	})
})
