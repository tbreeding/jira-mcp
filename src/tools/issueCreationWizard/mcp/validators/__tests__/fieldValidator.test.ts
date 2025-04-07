/**
 * Tests for Field Validator
 */

import { FieldCategory } from '../../../../../jira/types/fieldMetadata.types'
import { validateSingleField } from '../fieldValidator'
import { findFieldMetadata } from '../metadataFinder'
import { validateFieldTypeAndFormat } from '../typeValidator'
import type { CategorizedFields } from '../../../../../jira/api/getAndCategorizeFields'
import type { CategorizedField } from '../../../../../jira/types/fieldMetadata.types'

// Mock the dependencies
jest.mock('../metadataFinder')
jest.mock('../typeValidator')

describe('Field Validator', () => {
	// Create mock field metadata
	const mockRequiredField: CategorizedField = {
		id: 'required-field',
		name: 'Required Field',
		category: FieldCategory.REQUIRED,
		metadata: {
			id: 'required-field',
			name: 'Required Field',
			required: true,
			schema: { type: 'string' },
		},
	}

	const mockOptionalField: CategorizedField = {
		id: 'optional-field',
		name: 'Optional Field',
		category: FieldCategory.CUSTOM,
		metadata: {
			id: 'optional-field',
			name: 'Optional Field',
			required: false,
			schema: { type: 'string' },
		},
	}

	const mockFieldMetadata: CategorizedFields = {
		[FieldCategory.REQUIRED]: [mockRequiredField],
		[FieldCategory.SYSTEM]: [],
		[FieldCategory.CUSTOM]: [mockOptionalField],
	}

	beforeEach(() => {
		// Reset mocks before each test
		jest.resetAllMocks()

		// Set up default mock implementations
		const mockedFindMetadata = findFieldMetadata as jest.MockedFunction<typeof findFieldMetadata>
		mockedFindMetadata.mockImplementation((fieldId) => {
			if (fieldId === 'required-field') return mockRequiredField
			if (fieldId === 'optional-field') return mockOptionalField
			if (fieldId === 'field-without-metadata') {
				return {
					id: 'field-without-metadata',
					name: 'Field Without Metadata',
					category: FieldCategory.SYSTEM,
				} as any
			}
			return null
		})

		const mockedValidateType = validateFieldTypeAndFormat as jest.MockedFunction<typeof validateFieldTypeAndFormat>
		mockedValidateType.mockReturnValue([])
	})

	describe('validateSingleField', () => {
		it('should return error for unknown field', () => {
			// Execute the function
			const result = validateSingleField('unknown-field', 'any value', mockFieldMetadata)

			// Assert
			expect(result).toHaveLength(1)
			expect(result[0]).toContain('Unknown field')
			expect(findFieldMetadata).toHaveBeenCalledWith('unknown-field', mockFieldMetadata)
		})

		it('should validate a required field with a value', () => {
			// Execute
			const result = validateSingleField('required-field', 'valid value', mockFieldMetadata)

			// Assert
			expect(result).toHaveLength(0)
			expect(findFieldMetadata).toHaveBeenCalledWith('required-field', mockFieldMetadata)
			expect(validateFieldTypeAndFormat).toHaveBeenCalledWith('valid value', mockRequiredField)
		})

		it('should return error for a required field with no value', () => {
			// Execute with null value
			let result = validateSingleField('required-field', null, mockFieldMetadata)

			// Assert
			expect(result).toHaveLength(1)
			expect(result[0]).toContain('field is required')

			// Execute with undefined value
			result = validateSingleField('required-field', undefined, mockFieldMetadata)
			expect(result).toHaveLength(1)
			expect(result[0]).toContain('field is required')

			// Execute with empty string
			result = validateSingleField('required-field', '', mockFieldMetadata)
			expect(result).toHaveLength(1)
			expect(result[0]).toContain('field is required')
		})

		it('should validate an optional field with a value', () => {
			// Execute
			const result = validateSingleField('optional-field', 'some value', mockFieldMetadata)

			// Assert
			expect(result).toHaveLength(0)
			expect(findFieldMetadata).toHaveBeenCalledWith('optional-field', mockFieldMetadata)
			expect(validateFieldTypeAndFormat).toHaveBeenCalledWith('some value', mockOptionalField)
		})

		it('should not return error for an optional field with no value', () => {
			// Execute with null
			let result = validateSingleField('optional-field', null, mockFieldMetadata)

			// Assert
			expect(result).toHaveLength(0)

			// Execute with undefined
			result = validateSingleField('optional-field', undefined, mockFieldMetadata)
			expect(result).toHaveLength(0)

			// Execute with empty string
			result = validateSingleField('optional-field', '', mockFieldMetadata)
			expect(result).toHaveLength(0)
		})

		it('should include type validation errors when they occur', () => {
			// Setup a specific mock return for this test
			const typeError = 'Value must be a string'
			const mockedValidateType = validateFieldTypeAndFormat as jest.MockedFunction<typeof validateFieldTypeAndFormat>
			mockedValidateType.mockReturnValue([typeError])

			// Execute
			const result = validateSingleField('required-field', 123, mockFieldMetadata) // Number instead of string

			// Assert
			expect(result).toHaveLength(1)
			expect(result[0]).toBe(typeError)
			expect(validateFieldTypeAndFormat).toHaveBeenCalledWith(123, mockRequiredField)
		})

		it('should handle the field with missing metadata', () => {
			// Execute
			const result = validateSingleField('field-without-metadata', 'value', mockFieldMetadata)

			// Assert
			expect(result).toHaveLength(0)
			expect(validateFieldTypeAndFormat).toHaveBeenCalledWith('value', {
				id: 'field-without-metadata',
				name: 'Field Without Metadata',
				category: FieldCategory.SYSTEM,
			})
		})

		it('should accumulate all validation errors', () => {
			// Setup
			const mockedValidateTypeForTest = validateFieldTypeAndFormat as jest.MockedFunction<
				typeof validateFieldTypeAndFormat
			>
			mockedValidateTypeForTest.mockReturnValue(['Type validation error'])

			// For this test, we'll use a value that's not null/undefined/empty but fails type validation
			const result = validateSingleField('required-field', 'invalid value', mockFieldMetadata)

			// Assert
			expect(result).toHaveLength(1) // Only the type error
			expect(result[0]).toBe('Type validation error')
			expect(validateFieldTypeAndFormat).toHaveBeenCalledWith('invalid value', mockRequiredField)
		})
	})
})
