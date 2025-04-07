import { FieldCategory } from '../../../../jira/types/fieldMetadata.types'
import { convertToCategorizedFields, createValidationResponse, updateWizardWithFields } from '../fieldProcessorUtils'
import type { CategorizedField } from '../../../../jira/types/fieldMetadata.types'
import type { StateManager } from '../../stateManager'

// Mock dependencies
jest.mock('../../stateManager')
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('fieldProcessorUtils', () => {
	describe('convertToCategorizedFields', () => {
		it('should convert field metadata into categorized structure', () => {
			// Mock input field data
			const mockFields: CategorizedField[] = [
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
				{
					id: 'labels',
					name: 'Labels',
					category: FieldCategory.OPTIONAL,
					metadata: {
						id: 'labels',
						name: 'Labels',
						required: false,
						schema: { type: 'array' },
					},
				},
			]

			// Execute
			const result = convertToCategorizedFields(mockFields)

			// Verify
			expect(result[FieldCategory.REQUIRED]).toHaveLength(2)
			expect(result[FieldCategory.OPTIONAL]).toHaveLength(2)

			// Verify required fields
			expect(result[FieldCategory.REQUIRED].find((f) => f.id === 'summary')).toBeDefined()
			expect(result[FieldCategory.REQUIRED].find((f) => f.id === 'description')).toBeDefined()

			// Verify optional fields
			expect(result[FieldCategory.OPTIONAL].find((f) => f.id === 'priority')).toBeDefined()
			expect(result[FieldCategory.OPTIONAL].find((f) => f.id === 'labels')).toBeDefined()
		})

		it('should handle empty inputs', () => {
			// Test with empty array
			const result = convertToCategorizedFields([])

			expect(Object.keys(result)).toHaveLength(0)
		})
	})

	describe('createValidationResponse', () => {
		it('should create success response for valid validation result', () => {
			const validationResult = {
				isValid: true,
				errors: {},
			}

			const result = createValidationResponse(validationResult)

			expect(result.success).toBe(true)
			expect(result.message).toContain('All fields validated')
			expect(result.isValid).toBe(true)
		})

		it('should create failure response for invalid validation result', () => {
			const validationResult = {
				isValid: false,
				errors: {
					summary: ['Required field is missing'],
				},
			}

			const result = createValidationResponse(validationResult)

			expect(result.success).toBe(true)
			expect(result.message).toContain('Validation failed')
			expect(result.isValid).toBe(false)
			expect(result.errors).toEqual(validationResult.errors)
		})
	})

	describe('updateWizardWithFields', () => {
		const mockStateManager = {
			updateState: jest.fn(),
		} as unknown as StateManager

		beforeEach(() => {
			jest.clearAllMocks()
		})

		it('should update wizard state with new fields', () => {
			// Mock state update success
			;(mockStateManager.updateState as jest.Mock).mockReturnValue({
				success: true,
				data: {
					fields: {
						summary: 'Updated summary',
						description: 'New description',
					},
					currentStep: 'field_completion',
				},
			})

			// Execute
			const currentState = {
				fields: {
					summary: 'Old summary',
				},
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			}

			const newFields = {
				summary: 'Updated summary',
				description: 'New description',
			}

			const result = updateWizardWithFields(mockStateManager, currentState, newFields)

			// Verify
			expect(result.success).toBe(true)
			expect(result.message).toBe('Fields updated successfully')
			expect(mockStateManager.updateState).toHaveBeenCalledWith({
				fields: {
					...currentState.fields,
					...newFields,
				},
				currentStep: 'field_completion',
			})
		})

		it('should handle state update failure', () => {
			// Mock state update failure
			;(mockStateManager.updateState as jest.Mock).mockReturnValue({
				success: false,
				error: { message: 'Failed to update state' },
			})

			// Execute
			const currentState = {
				fields: {},
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			}

			const newFields = {
				summary: 'Test summary',
			}

			const result = updateWizardWithFields(mockStateManager, currentState, newFields)

			// Verify
			expect(result.success).toBe(false)
			expect(result.message).toBe('Failed to update state: Failed to update state')
		})
	})
})
