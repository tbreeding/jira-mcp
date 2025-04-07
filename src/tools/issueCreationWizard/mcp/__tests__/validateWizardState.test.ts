import { validateWizardState } from '../validateWizardState'
import { createErrorResult } from '../utils'
import { log } from '../../../../utils/logger'
import { WizardStep } from '../../types'
import type { WizardState } from '../../types'

jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('validateWizardState', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return success and data when state is valid', () => {
		const mockState: WizardState = {
			projectKey: 'TEST',
			issueTypeId: 'issue-123',
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		const result = validateWizardState({
			success: true,
			data: mockState,
		})

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data).toBe(mockState)
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('Current wizard state'))
	})

	it('should return error when state retrieval fails', () => {
		const mockError = { message: 'State not found', code: 'STATE_NOT_FOUND' }

		const result = validateWizardState({
			success: false,
			error: mockError,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errorResult).toEqual(createErrorResult('No active issue creation wizard found'))
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('Failed to retrieve wizard state'))
		expect(log).toHaveBeenCalledWith(expect.stringContaining('Failed to retrieve wizard state: State not found'))
	})

	it('should return error when projectKey is missing', () => {
		const mockState: Partial<WizardState> = {
			// projectKey is missing
			issueTypeId: 'issue-123',
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		const result = validateWizardState({
			success: true,
			data: mockState as WizardState,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errorResult).toEqual(createErrorResult('Project and issue type are required for issue creation'))
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('ERROR: Missing required fields'))
	})

	it('should return error when projectKey is an empty string', () => {
		const mockState: Partial<WizardState> = {
			projectKey: '',
			issueTypeId: 'issue-123',
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		const result = validateWizardState({
			success: true,
			data: mockState as WizardState,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errorResult).toEqual(createErrorResult('Project and issue type are required for issue creation'))
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('ERROR: Missing required fields'))
	})

	it('should return error when issueTypeId is missing', () => {
		const mockState: Partial<WizardState> = {
			projectKey: 'TEST-123',
			issueTypeId: undefined,
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		const result = validateWizardState({
			success: true,
			data: mockState as WizardState,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errorResult).toEqual(createErrorResult('Project and issue type are required for issue creation'))
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('ERROR: Missing required fields'))
	})

	it('should return error when issueTypeId is an empty string', () => {
		const mockState: Partial<WizardState> = {
			projectKey: 'TEST-123',
			issueTypeId: '',
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		const result = validateWizardState({
			success: true,
			data: mockState as WizardState,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errorResult).toEqual(createErrorResult('Project and issue type are required for issue creation'))
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('ERROR: Missing required fields'))
	})

	it('should return error when issueTypeId is 0 (which is falsy)', () => {
		const mockState: Partial<WizardState> = {
			projectKey: 'TEST-123',
			issueTypeId: 0 as any, // Casting to any as issueTypeId is normally a string
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		const result = validateWizardState({
			success: true,
			data: mockState as WizardState,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errorResult).toEqual(createErrorResult('Project and issue type are required for issue creation'))
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('ERROR: Missing required fields'))
	})

	it('should return error when both projectKey and issueTypeId are missing', () => {
		const mockState: Partial<WizardState> = {
			// both projectKey and issueTypeId are missing
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: { summary: 'Test issue' },
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		const result = validateWizardState({
			success: true,
			data: mockState as WizardState,
		})

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errorResult).toEqual(createErrorResult('Project and issue type are required for issue creation'))
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('ERROR: Missing required fields'))
	})

	it('should handle empty fields object', () => {
		const mockState: WizardState = {
			projectKey: 'TEST',
			issueTypeId: 'issue-123',
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: {},
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		const result = validateWizardState({
			success: true,
			data: mockState,
		})

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data).toBe(mockState)
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('fieldsCount=0'))
	})

	it('should handle null fields object', () => {
		const mockState: WizardState = {
			projectKey: 'TEST',
			issueTypeId: 'issue-123',
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			fields: null as any, // Forcing null to test the fallback
			validation: { errors: {}, warnings: {} },
			timestamp: 123456789,
		}

		const result = validateWizardState({
			success: true,
			data: mockState,
		})

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data).toBe(mockState)
		}
		expect(log).toHaveBeenCalledWith(expect.stringContaining('fieldsCount=0'))
	})
})
