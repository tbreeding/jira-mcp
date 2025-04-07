import { FieldCategory } from '../../../../jira/types/fieldMetadata.types'
import { validateFieldsWithMetadata } from '../fieldValidationService'
import { validateSingleField } from '../validators/fieldValidator'

// Mock dependencies
jest.mock('../validators/fieldValidator')

describe('fieldValidationService', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should validate all fields against metadata', () => {
		// Mock input data
		const fields = {
			summary: 'Test issue',
			description: 'Test description',
			priority: { id: '1' },
		}

		// Mock field metadata
		const fieldMetadata = {
			[FieldCategory.REQUIRED]: [
				{
					id: 'summary',
					name: 'Summary',
					category: FieldCategory.REQUIRED,
					metadata: {
						id: 'summary',
						name: 'Summary',
						required: true,
						schema: { type: 'string' },
					},
				},
				{
					id: 'description',
					name: 'Description',
					category: FieldCategory.REQUIRED,
					metadata: {
						id: 'description',
						name: 'Description',
						required: true,
						schema: { type: 'string' },
					},
				},
			],
			[FieldCategory.OPTIONAL]: [
				{
					id: 'priority',
					name: 'Priority',
					category: FieldCategory.OPTIONAL,
					metadata: {
						id: 'priority',
						name: 'Priority',
						required: false,
						schema: { type: 'object' },
					},
				},
			],
		}

		// Mock validation results for each field
		;(validateSingleField as jest.Mock).mockImplementation((id) => {
			return id === 'description' ? ['Description is too short'] : []
		})

		// Execute
		const result = validateFieldsWithMetadata(fields, fieldMetadata)

		// Verify
		expect(validateSingleField).toHaveBeenCalledTimes(3)
		expect(validateSingleField).toHaveBeenCalledWith('summary', 'Test issue', fieldMetadata)
		expect(validateSingleField).toHaveBeenCalledWith('description', 'Test description', fieldMetadata)
		expect(validateSingleField).toHaveBeenCalledWith('priority', { id: '1' }, fieldMetadata)

		// Check result
		expect(result.isValid).toBe(false)
		expect(result.errors).toEqual({
			description: ['Description is too short'],
		})
	})

	it('should return valid result when no validation errors', () => {
		// Mock input data
		const fields = {
			summary: 'Test issue',
		}

		// Mock field metadata
		const fieldMetadata = {
			[FieldCategory.REQUIRED]: [
				{
					id: 'summary',
					name: 'Summary',
					category: FieldCategory.REQUIRED,
					metadata: {
						id: 'summary',
						name: 'Summary',
						required: true,
						schema: { type: 'string' },
					},
				},
			],
		}

		// Mock validation result (no errors)
		;(validateSingleField as jest.Mock).mockReturnValue([])

		// Execute
		const result = validateFieldsWithMetadata(fields, fieldMetadata)

		// Verify
		expect(validateSingleField).toHaveBeenCalledTimes(1)
		expect(validateSingleField).toHaveBeenCalledWith('summary', 'Test issue', fieldMetadata)

		// Check result
		expect(result.isValid).toBe(true)
		expect(result.errors).toEqual({})
	})

	it('should handle empty input properly', () => {
		// Mock empty inputs
		const fields = {}
		const fieldMetadata = {}

		// Execute
		const result = validateFieldsWithMetadata(fields, fieldMetadata)

		// Verify
		expect(validateSingleField).not.toHaveBeenCalled()

		// Check result
		expect(result.isValid).toBe(true)
		expect(result.errors).toEqual({})
	})
})
