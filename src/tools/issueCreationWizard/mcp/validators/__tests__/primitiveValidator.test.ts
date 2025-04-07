/**
 * Tests for Primitive Value Validator
 */
import { validatePrimitiveValue } from '../allowedValuesValidators/primitiveValidator'

describe('Primitive Value Validator', () => {
	describe('validatePrimitiveValue', () => {
		// Simple allowed values (direct primitives)
		const primitiveAllowedValues = ['red', 'green', 'blue', 42, true]

		// Object-based allowed values
		const objectAllowedValues = [
			{ value: 'red', name: 'Red' },
			{ value: 'green', name: 'Green' },
			{ value: 42, name: 'Forty-Two' },
		]

		it('should validate direct primitive values', () => {
			// Valid cases
			expect(validatePrimitiveValue('red', primitiveAllowedValues)).toHaveLength(0)
			expect(validatePrimitiveValue(42, primitiveAllowedValues)).toHaveLength(0)
			expect(validatePrimitiveValue(true, primitiveAllowedValues)).toHaveLength(0)

			// Invalid case
			const errors = validatePrimitiveValue('purple', primitiveAllowedValues)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toContain('not in the list of allowed values')
		})

		it('should validate against object values with "value" property', () => {
			// Valid case - matching value property
			const validErrors = validatePrimitiveValue('red', objectAllowedValues)
			expect(validErrors).toHaveLength(0)

			const validNumberErrors = validatePrimitiveValue(42, objectAllowedValues)
			expect(validNumberErrors).toHaveLength(0)

			// Invalid case
			const invalidErrors = validatePrimitiveValue('blue', objectAllowedValues)
			expect(invalidErrors).toHaveLength(1)
			expect(invalidErrors[0]).toContain('not in the list of allowed values')
		})

		it('should validate against object values with "name" property', () => {
			// Valid case - matching name property
			const validErrors = validatePrimitiveValue('Red', objectAllowedValues)
			expect(validErrors).toHaveLength(0)

			const validNameErrors = validatePrimitiveValue('Forty-Two', objectAllowedValues)
			expect(validNameErrors).toHaveLength(0)

			// Invalid case
			const invalidErrors = validatePrimitiveValue('Yellow', objectAllowedValues)
			expect(invalidErrors).toHaveLength(1)
			expect(invalidErrors[0]).toContain('not in the list of allowed values')
		})

		it('should handle malformed allowed values', () => {
			// Mixed allowed values with different structures
			const mixedAllowedValues = [
				'red',
				{ name: 'Green' }, // missing value property
				{ value: 'blue' }, // missing name property
				null,
				undefined,
			]

			// Should match direct value
			expect(validatePrimitiveValue('red', mixedAllowedValues)).toHaveLength(0)

			// Should match object name
			expect(validatePrimitiveValue('Green', mixedAllowedValues)).toHaveLength(0)

			// Should match object value
			expect(validatePrimitiveValue('blue', mixedAllowedValues)).toHaveLength(0)

			// Should not match non-existent value
			expect(validatePrimitiveValue('purple', mixedAllowedValues)).toHaveLength(1)
		})

		it('should handle string conversion for error messages', () => {
			// Test with non-string primitive
			const errors = validatePrimitiveValue(99, primitiveAllowedValues)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toBe('Value "99" is not in the list of allowed values')
		})
	})
})
