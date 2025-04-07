/**
 * Tests for Allowed Values Validator
 */

import { FieldCategory } from '../../../../../jira/types/fieldMetadata.types'
import { validateAllowedValues } from '../allowedValuesValidator'
import type { CategorizedField, JiraFieldMetadata } from '../../../../../jira/types/fieldMetadata.types'

describe('Allowed Values Validator', () => {
	// Helper to create test field metadata
	function createFieldMeta(allowedValues: unknown[] | undefined): CategorizedField {
		return {
			id: 'test-field',
			name: 'Test Field',
			category: FieldCategory.REQUIRED,
			metadata: {
				id: 'test-field',
				name: 'Test Field',
				required: true,
				schema: { type: 'option' },
				allowedValues,
			},
		}
	}

	describe('Object ID validation', () => {
		it('should pass for valid object IDs', () => {
			const allowedValues = [
				{ id: '1', value: 'Option 1' },
				{ id: '2', value: 'Option 2' },
				{ id: '3', value: 'Option 3' },
			]
			const fieldMeta = createFieldMeta(allowedValues)

			// Valid object with ID
			const errors = validateAllowedValues({ id: '2' }, fieldMeta)
			expect(errors).toHaveLength(0)
		})

		it('should fail for invalid object IDs', () => {
			const allowedValues = [
				{ id: '1', value: 'Option 1' },
				{ id: '2', value: 'Option 2' },
				{ id: '3', value: 'Option 3' },
			]
			const fieldMeta = createFieldMeta(allowedValues)

			// Invalid ID
			const errors = validateAllowedValues({ id: '4' }, fieldMeta)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toContain('not in the list of allowed values')
		})

		it('should fail for objects without ID property', () => {
			const allowedValues = [
				{ id: '1', value: 'Option 1' },
				{ id: '2', value: 'Option 2' },
			]
			const fieldMeta = createFieldMeta(allowedValues)

			// Object without ID property
			const errors = validateAllowedValues({ value: 'Option 1' }, fieldMeta)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toContain('must have an "id" property')
		})
	})

	describe('Array validation', () => {
		it('should pass for valid array of objects with IDs', () => {
			const allowedValues = [
				{ id: '1', value: 'Option 1' },
				{ id: '2', value: 'Option 2' },
				{ id: '3', value: 'Option 3' },
			]
			const fieldMeta = createFieldMeta(allowedValues)

			// Valid array with IDs
			const errors = validateAllowedValues([{ id: '1' }, { id: '2' }], fieldMeta)
			expect(errors).toHaveLength(0)
		})

		it('should fail for array with invalid object IDs', () => {
			const allowedValues = [
				{ id: '1', value: 'Option 1' },
				{ id: '2', value: 'Option 2' },
			]
			const fieldMeta = createFieldMeta(allowedValues)

			// Array with one invalid ID
			const errors = validateAllowedValues([{ id: '1' }, { id: '3' }], fieldMeta)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toContain('Item at index 1')
		})

		it('should pass for valid array of primitive values', () => {
			const allowedValues = ['option1', 'option2', 'option3']
			const fieldMeta = createFieldMeta(allowedValues)

			// Valid array of strings
			const errors = validateAllowedValues(['option1', 'option2'], fieldMeta)
			expect(errors).toHaveLength(0)
		})

		it('should fail for array with invalid primitive values', () => {
			const allowedValues = ['option1', 'option2', 'option3']
			const fieldMeta = createFieldMeta(allowedValues)

			// Array with one invalid string
			const errors = validateAllowedValues(['option1', 'invalid'], fieldMeta)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toContain('Item at index 1')
		})

		it('should handle empty arrays', () => {
			const allowedValues = ['option1', 'option2', 'option3']
			const fieldMeta = createFieldMeta(allowedValues)

			// Empty array
			const errors = validateAllowedValues([], fieldMeta)
			expect(errors).toHaveLength(0)
		})
	})

	describe('Primitive value validation', () => {
		it('should pass for valid primitive values', () => {
			const allowedValues = ['option1', 'option2', 'option3']
			const fieldMeta = createFieldMeta(allowedValues)

			// Valid string
			const errors = validateAllowedValues('option2', fieldMeta)
			expect(errors).toHaveLength(0)
		})

		it('should fail for invalid primitive values', () => {
			const allowedValues = ['option1', 'option2', 'option3']
			const fieldMeta = createFieldMeta(allowedValues)

			// Invalid string
			const errors = validateAllowedValues('invalid', fieldMeta)
			expect(errors).toHaveLength(1)
			expect(errors[0]).toContain('not in the list of allowed values')
		})

		it('should pass for valid primitive values in objects', () => {
			const allowedValues = [{ value: 'option1' }, { value: 'option2' }, { name: 'option3' }]
			const fieldMeta = createFieldMeta(allowedValues)

			// Valid primitive matching value property
			const valueErrors = validateAllowedValues('option2', fieldMeta)
			expect(valueErrors).toHaveLength(0)

			// Valid primitive matching name property
			const nameErrors = validateAllowedValues('option3', fieldMeta)
			expect(nameErrors).toHaveLength(0)
		})
	})

	describe('Skip validation cases', () => {
		it('should skip validation for null values', () => {
			const allowedValues = [{ id: '1' }, { id: '2' }]
			const fieldMeta = createFieldMeta(allowedValues)

			const errors = validateAllowedValues(null, fieldMeta)
			expect(errors).toHaveLength(0)
		})

		it('should skip validation for undefined values', () => {
			const allowedValues = [{ id: '1' }, { id: '2' }]
			const fieldMeta = createFieldMeta(allowedValues)

			const errors = validateAllowedValues(undefined, fieldMeta)
			expect(errors).toHaveLength(0)
		})

		it('should skip validation for empty allowed values array', () => {
			const fieldMeta = createFieldMeta([])

			const errors = validateAllowedValues('test', fieldMeta)
			expect(errors).toHaveLength(0)
		})

		it('should skip validation when allowedValues is null', () => {
			// For null allowedValues, we use undefined instead since the type doesn't allow null
			const fieldMeta = createFieldMeta(undefined)

			const errors = validateAllowedValues('test', fieldMeta)
			expect(errors).toHaveLength(0)
		})

		it('should skip validation when allowedValues is undefined', () => {
			const fieldMeta = createFieldMeta(undefined)

			const errors = validateAllowedValues('test', fieldMeta)
			expect(errors).toHaveLength(0)
		})

		it('should skip validation when metadata is undefined', () => {
			const fieldWithNoMetadata: CategorizedField = {
				id: 'test-field',
				name: 'Test Field',
				category: FieldCategory.REQUIRED,
				metadata: undefined as unknown as JiraFieldMetadata,
			}

			const errors = validateAllowedValues('test', fieldWithNoMetadata)
			expect(errors).toHaveLength(0)
		})
	})

	// We can add more edge cases if needed to increase coverage
	describe('Edge cases', () => {
		it('should handle fields with complex metadata structures', () => {
			// This is a more complex field structure that might have nested properties
			const complexField: CategorizedField = {
				id: 'complex-field',
				name: 'Complex Field',
				category: FieldCategory.REQUIRED,
				metadata: {
					id: 'complex-field',
					name: 'Complex Field',
					required: true,
					schema: {
						type: 'option',
						custom: 'custom-type',
						items: 'string',
					},
					allowedValues: [
						{ value: 'value1', name: 'Name 1', key: 'key1' },
						{ value: 'value2', name: 'Name 2', key: 'key2' },
					],
				},
			}

			// Test with different types of values
			expect(validateAllowedValues('value1', complexField)).toHaveLength(0)
			expect(validateAllowedValues('Name 2', complexField)).toHaveLength(0)
			expect(validateAllowedValues('unknown', complexField)).toHaveLength(1)
		})
	})
})
