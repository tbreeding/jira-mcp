import { extractNumericValue } from '../extractNumericValue'

describe('extractNumericValue', () => {
	test('returns number values directly', () => {
		expect(extractNumericValue(42)).toBe(42)
		expect(extractNumericValue(0)).toBe(0)
		expect(extractNumericValue(-10.5)).toBe(-10.5)
	})

	test('extracts value from objects with value property', () => {
		expect(extractNumericValue({ value: 42 })).toBe(42)
		expect(extractNumericValue({ value: '42' })).toBe(42)
	})

	test('returns null for null or undefined', () => {
		expect(extractNumericValue(null)).toBeNull()
		expect(extractNumericValue(undefined)).toBeNull()
	})

	test('returns null for invalid inputs', () => {
		expect(extractNumericValue('not a number')).toBeNull()
		expect(extractNumericValue([])).toBeNull()
		expect(extractNumericValue({ otherProp: 42 })).toBeNull()
	})
})
