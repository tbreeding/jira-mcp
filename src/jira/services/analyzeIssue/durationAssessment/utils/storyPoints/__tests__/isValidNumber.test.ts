import { isValidNumber } from '../isValidNumber'

describe('isValidNumber', () => {
	test('returns number for valid numeric input', () => {
		expect(isValidNumber(42)).toBe(42)
		expect(isValidNumber('42')).toBe(42)
		expect(isValidNumber(0)).toBe(0)
		expect(isValidNumber(-10.5)).toBe(-10.5)
	})

	test('returns null for invalid numeric input', () => {
		expect(isValidNumber(NaN)).toBeNull()
		expect(isValidNumber('not a number')).toBeNull()
		expect(isValidNumber(undefined)).toBeNull()
		expect(isValidNumber(null)).toBeNull()
		expect(isValidNumber({})).toBeNull()
		expect(isValidNumber([])).toBeNull()
	})
})
