import { convertToADF } from '../../../../jira/utils/adf'
import { WizardStep } from '../../types'
import { formatFieldsForSubmission, isADFField, getFormattedFieldValue } from '../adfFormatter'
import type { WizardState } from '../../types'

// Mock the convertToADF function
jest.mock('../../../../jira/utils/adf', () => ({
	convertToADF: jest.fn((text) => ({
		version: 1,
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: text,
					},
				],
			},
		],
	})),
}))

describe('adfFormatter', () => {
	const mockADFDoc = {
		version: 1,
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: 'Test content',
					},
				],
			},
		],
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('formatFieldsForSubmission', () => {
		it('should convert string description to ADF format', () => {
			// Setup
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				fields: {
					summary: 'Test issue',
					description: 'This is a description',
				},
				validation: {
					errors: {},
					warnings: {},
				},
				timestamp: Date.now(),
			}

			// Execute
			const result = formatFieldsForSubmission(state)

			// Verify
			expect(convertToADF).toHaveBeenCalledWith('This is a description')
			expect(result.description).toEqual(
				expect.objectContaining({
					type: 'doc',
					version: 1,
				}),
			)
			expect(result.summary).toEqual('Test issue')
		})

		it('should not convert description if it is not a string', () => {
			// Setup
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				fields: {
					summary: 'Test issue',
					description: mockADFDoc,
				},
				validation: {
					errors: {},
					warnings: {},
				},
				timestamp: Date.now(),
			}

			// Execute
			const result = formatFieldsForSubmission(state)

			// Verify
			expect(convertToADF).not.toHaveBeenCalled()
			expect(result.description).toEqual(mockADFDoc)
		})

		it('should handle state without description field', () => {
			// Setup
			const state: WizardState = {
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				fields: {
					summary: 'Test issue',
				},
				validation: {
					errors: {},
					warnings: {},
				},
				timestamp: Date.now(),
			}

			// Execute
			const result = formatFieldsForSubmission(state)

			// Verify
			expect(convertToADF).not.toHaveBeenCalled()
			expect(result.summary).toEqual('Test issue')
			expect(result.description).toBeUndefined()
		})
	})

	describe('isADFField', () => {
		it('should return true for description field', () => {
			expect(isADFField('description')).toBe(true)
		})

		it('should return true for comment field', () => {
			expect(isADFField('comment')).toBe(true)
		})

		it('should return false for non-ADF fields', () => {
			expect(isADFField('summary')).toBe(false)
			expect(isADFField('priority')).toBe(false)
			expect(isADFField('custom_field')).toBe(false)
		})
	})

	describe('getFormattedFieldValue', () => {
		it('should return ADF document as-is', () => {
			// Setup
			const adfDoc = { type: 'doc', version: 1, content: [] }

			// Execute
			const result = getFormattedFieldValue('description', adfDoc)

			// Verify
			expect(result).toBe(adfDoc)
			expect(convertToADF).not.toHaveBeenCalled()
		})

		it('should convert string to ADF for description field', () => {
			// Execute
			const result = getFormattedFieldValue('description', 'Test description')

			// Verify
			expect(convertToADF).toHaveBeenCalledWith('Test description')
			expect(result).toEqual(
				expect.objectContaining({
					type: 'doc',
					version: 1,
				}),
			)
		})

		it('should convert string to ADF for comment field', () => {
			// Execute
			const result = getFormattedFieldValue('comment', 'Test comment')

			// Verify
			expect(convertToADF).toHaveBeenCalledWith('Test comment')
			expect(result).toEqual(
				expect.objectContaining({
					type: 'doc',
					version: 1,
				}),
			)
		})

		it('should return non-string values as-is for ADF fields', () => {
			// Setup
			const numValue = 123
			const boolValue = true
			const objValue = { key: 'value' }

			// Execute and verify
			expect(getFormattedFieldValue('description', numValue)).toBe(numValue)
			expect(getFormattedFieldValue('description', boolValue)).toBe(boolValue)
			expect(getFormattedFieldValue('description', objValue)).toBe(objValue)
			expect(convertToADF).not.toHaveBeenCalled()
		})

		it('should return values as-is for non-ADF fields', () => {
			// Execute and verify
			expect(getFormattedFieldValue('summary', 'Test summary')).toBe('Test summary')
			expect(getFormattedFieldValue('priority', 'High')).toBe('High')
			expect(convertToADF).not.toHaveBeenCalled()
		})

		it('should handle null and undefined values', () => {
			// Execute and verify
			expect(getFormattedFieldValue('description', null)).toBe(null)
			expect(getFormattedFieldValue('description', undefined)).toBe(undefined)
			expect(convertToADF).not.toHaveBeenCalled()
		})
	})
})
