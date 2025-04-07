import { extractObjectValue } from '../extractObjectValue'

describe('extractObjectValue', () => {
	test('extracts value property from object', () => {
		expect(extractObjectValue({ value: 42 })).toBe(42)
		expect(extractObjectValue({ value: '42' })).toBe(42)
		expect(extractObjectValue({ value: 0 })).toBe(0)
	})

	test('returns null for invalid value property', () => {
		expect(extractObjectValue({ value: 'not a number' })).toBeNull()
		expect(extractObjectValue({ value: null })).toBeNull()
		expect(extractObjectValue({ value: undefined })).toBeNull()
		expect(extractObjectValue({ value: NaN })).toBeNull()
	})

	test('returns null for object without value property', () => {
		expect(extractObjectValue({})).toBeNull()
		expect(extractObjectValue({ otherProp: 42 })).toBeNull()
	})
})
