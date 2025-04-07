/**
 * Tests for Array Validator
 */
import { validateArrayValues } from '../allowedValuesValidators/arrayValidator'

describe('Array Validator', () => {
	describe('validateArrayValues', () => {
		// Define allowed values for testing
		const objectAllowedValues = [
			{ id: '1', value: 'Option 1' },
			{ id: '2', value: 'Option 2' },
			{ id: '3', value: 'Option 3' },
		]

		const primitiveAllowedValues = ['red', 'green', 'blue']

		it('should return no errors for non-array values (handled by type validator)', () => {
			const errors = validateArrayValues('not-an-array', objectAllowedValues)
			expect(errors).toHaveLength(0)
		})

		it('should return no errors for empty arrays', () => {
			const errors = validateArrayValues([], objectAllowedValues)
			expect(errors).toHaveLength(0)
		})

		it('should validate arrays of objects with IDs', () => {
			// Valid case
			const validArray = [{ id: '1' }, { id: '3' }]
			const validErrors = validateArrayValues(validArray, objectAllowedValues)
			expect(validErrors).toHaveLength(0)

			// Invalid case
			const invalidArray = [{ id: '1' }, { id: '99' }]
			const invalidErrors = validateArrayValues(invalidArray, objectAllowedValues)
			expect(invalidErrors).toHaveLength(1)
			expect(invalidErrors[0]).toContain('Item at index 1')
			expect(invalidErrors[0]).toContain('not in the list of allowed values')
		})

		it('should validate arrays of primitive values', () => {
			// Valid case
			const validArray = ['red', 'blue']
			const validErrors = validateArrayValues(validArray, primitiveAllowedValues)
			expect(validErrors).toHaveLength(0)

			// Invalid case
			const invalidArray = ['red', 'yellow']
			const invalidErrors = validateArrayValues(invalidArray, primitiveAllowedValues)
			expect(invalidErrors).toHaveLength(1)
			expect(invalidErrors[0]).toContain('Item at index 1')
			expect(invalidErrors[0]).toContain('not in the list of allowed values')
		})

		it('should handle mixed arrays by checking type of first item', () => {
			// Mixed array treated as objects, second item missing id
			const mixedArray = [{ id: '1' }, { name: 'Option 2' }]
			const errors = validateArrayValues(mixedArray, objectAllowedValues)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toContain('Item at index 1')
			expect(errors[0]).toContain('must have an "id" property')
		})
	})
})
