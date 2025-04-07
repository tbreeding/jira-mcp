/**
 * Tests for Object Validator
 */
import { validateObjectWithId } from '../allowedValuesValidators/objectValidator'

describe('Object Validator', () => {
	describe('validateObjectWithId', () => {
		// Define allowed values for testing
		const allowedValues = [
			{ id: '1', value: 'Option 1' },
			{ id: '2', value: 'Option 2' },
			{ id: '3', value: 'Option 3' },
		]

		it('should return no errors for non-object values (handled by type validator)', () => {
			const errors = validateObjectWithId('not-an-object', allowedValues)
			expect(errors).toHaveLength(0)
		})

		it('should return no errors for null values (handled by type validator)', () => {
			const errors = validateObjectWithId(null, allowedValues)
			expect(errors).toHaveLength(0)
		})

		it('should return error for objects without an id property', () => {
			const invalidObject = { name: 'Option 1' }
			const errors = validateObjectWithId(invalidObject, allowedValues)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toBe('Object value must have an "id" property')
		})

		it('should validate objects with valid ids', () => {
			const validObject = { id: '2' }
			const errors = validateObjectWithId(validObject, allowedValues)
			expect(errors).toHaveLength(0)
		})

		it('should return error for objects with invalid ids', () => {
			const invalidObject = { id: '99' }
			const errors = validateObjectWithId(invalidObject, allowedValues)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toContain('not in the list of allowed values')
		})

		it('should handle malformed allowed values', () => {
			// Missing id in allowed values
			const badAllowedValues = [{ value: 'Option 1' }, { id: '2', value: 'Option 2' }, null]

			const testObject = { id: '2' }
			const errors = validateObjectWithId(testObject, badAllowedValues)
			expect(errors).toHaveLength(0) // Should find id: '2'

			const invalidObject = { id: '1' }
			const errors2 = validateObjectWithId(invalidObject, badAllowedValues)
			expect(errors2).toHaveLength(1) // Shouldn't find id: '1'
		})
	})
})
