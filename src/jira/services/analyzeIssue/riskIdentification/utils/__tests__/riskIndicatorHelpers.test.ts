/**
 * Tests for risk indicator helper utility functions
 *
 * This file contains tests for the helper functions that support the detectRiskIndicators
 * functionality, ensuring proper pattern matching and severity determination.
 */

import { checkStringPattern, checkRegexPattern, determineSeverity } from '../riskIndicatorHelpers'

describe('checkStringPattern', () => {
	test('returns null when pattern is not found', () => {
		const result = checkStringPattern('some text content', 'missing pattern', 'TestCategory')
		expect(result).toBeNull()
	})

	test('returns formatted string when pattern is found', () => {
		const result = checkStringPattern('this text contains a pattern', 'contains a', 'TestCategory')
		expect(result).toBe("TestCategory: 'contains a' found in text")
	})

	test('handles case insensitivity correctly', () => {
		const result = checkStringPattern('this text has uppercase', 'has uppercase', 'TestCategory')
		expect(result).toBe("TestCategory: 'has uppercase' found in text")
	})
})

describe('checkRegexPattern', () => {
	test('returns null when pattern is not matched', () => {
		const result = checkRegexPattern('some text content', /missing\d+pattern/, 'TestCategory')
		expect(result).toBeNull()
	})

	test('returns formatted string when regex pattern is matched', () => {
		const result = checkRegexPattern('issue number ABC-123 in text', /[A-Z]+-\d+/, 'TestCategory')
		expect(result).toBe("TestCategory: Pattern match '[A-Z]+-\\d+' found in text")
	})

	test('handles regex flags correctly', () => {
		const result = checkRegexPattern('UPPERCASE TEXT', /uppercase/i, 'TestCategory')
		expect(result).toBe("TestCategory: Pattern match 'uppercase/' found in text")
	})
})

describe('determineSeverity', () => {
	test('returns low severity for 0 indicators', () => {
		expect(determineSeverity(0)).toBe('low')
	})

	test('returns low severity for 1 indicator', () => {
		expect(determineSeverity(1)).toBe('low')
	})

	test('returns low severity for 2 indicators', () => {
		expect(determineSeverity(2)).toBe('low')
	})

	test('returns medium severity for 3 indicators', () => {
		expect(determineSeverity(3)).toBe('medium')
	})

	test('returns medium severity for 5 indicators', () => {
		expect(determineSeverity(5)).toBe('medium')
	})

	test('returns high severity for 6 indicators', () => {
		expect(determineSeverity(6)).toBe('high')
	})

	test('returns high severity for many indicators', () => {
		expect(determineSeverity(20)).toBe('high')
	})
})
