import * as categorizeFields from '../../../../jira/api/getAndCategorizeFields'
import * as fieldMetadataApi from '../../../../jira/api/getFieldMetadataFunction'
import * as projectsApi from '../../../../jira/api/getProjects'
import { processFieldsAndState } from '../fieldProcessor'
import * as fieldProcessorUtils from '../fieldProcessorUtils'
import * as fieldValidationService from '../fieldValidationService'
import * as updateStateMetadata from '../updateStateWithMetadata'
import * as utils from '../utils'
import type { StateManager } from '../../stateManager'
import { WizardStep } from '../../types'
import type { WizardState } from '../../types'

// Mock dependencies
jest.mock('../fieldProcessorUtils')
jest.mock('../fieldValidationService')
jest.mock('../../../../jira/api/getFieldMetadataFunction')
jest.mock('../../../../jira/api/getProjects')
jest.mock('../../../../jira/api/getAndCategorizeFields')
jest.mock('../utils')
jest.mock('../updateStateWithMetadata')
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('processFieldsAndState', () => {
	const mockJiraConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'test@example.com',
		apiToken: 'test-token',
	}

	const mockWizardStateInfo = {
		state: {
			active: true,
			currentStep: WizardStep.FIELD_COMPLETION,
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
			fields: {
				existingField: 'existing value',
			},
			validation: { errors: {}, warnings: {} },
			analysis: {},
			timestamp: Date.now(),
		} as WizardState,
		projectKey: 'PROJ',
		issueTypeId: 'issue-123',
	}

	const mockStateManager = {
		updateState: jest.fn(),
		getState: jest.fn(),
	} as unknown as StateManager

	const mockFieldMetadata = [
		{
			id: 'summary',
			name: 'Summary',
			required: true,
			schema: { type: 'string' },
		},
		{
			id: 'description',
			name: 'Description',
			required: false,
			schema: { type: 'string' },
		},
	]

	beforeEach(() => {
		jest.clearAllMocks()

		// Mock getProjectByKey to return success with a project ID
		;(projectsApi.getProjectByKey as jest.Mock).mockResolvedValue({
			success: true,
			value: { id: 'project-123' },
		})

		// Mock getAndCategorizeFields
		;(categorizeFields.getAndCategorizeFields as jest.Mock).mockResolvedValue({
			success: true,
			value: mockFieldMetadata,
		})

		// Mock convertToCategorizedFields
		;(fieldProcessorUtils.convertToCategorizedFields as jest.Mock).mockReturnValue(mockFieldMetadata)

		// Mock getFieldMetadata
		;(fieldMetadataApi.getFieldMetadata as jest.Mock).mockResolvedValue({
			success: true,
			value: { fieldMetadata: mockFieldMetadata },
		})

		// Mock createProcessErrorResult
		;(utils.createProcessErrorResult as jest.Mock).mockImplementation((message) => {
			return {
				success: false,
				message,
			}
		})

		// Mock updateStateWithMetadata to return success by default
		;(updateStateMetadata.updateStateWithMetadata as jest.Mock).mockResolvedValue({
			success: true,
			data: mockWizardStateInfo.state,
		})

		// Mock updateState to return success
		;(mockStateManager.updateState as jest.Mock).mockResolvedValue({ success: true })
		// Mock getState to return a successful state object
		;(mockStateManager.getState as jest.Mock).mockResolvedValue({
			success: true,
			data: mockWizardStateInfo.state,
		})
	})

	it('should successfully update state with valid fields', async () => {
		// Setup validation mock
		const mockValidationResult = {
			isValid: true,
			errors: {},
		}

		;(fieldValidationService.validateFieldsWithMetadata as jest.Mock).mockReturnValue(mockValidationResult)

		// Mock createValidationResponse and updateWizardWithFields
		;(fieldProcessorUtils.updateWizardWithFields as jest.Mock).mockReturnValue({
			success: true,
			message: 'Fields updated successfully',
			updatedFields: ['summary', 'description'],
		})

		// Execute
		const updateFields = {
			fields: {
				summary: 'New Issue',
				description: 'New Description',
			},
			validateOnly: false,
		}

		const result = await processFieldsAndState(mockStateManager, mockJiraConfig, mockWizardStateInfo, updateFields)

		// Verify
		expect(result).toEqual({
			success: true,
			message: 'Fields updated successfully',
			updatedFields: ['summary', 'description'],
		})

		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).toHaveBeenCalledWith(
			'PROJ',
			'project-123',
			'issue-123',
			mockJiraConfig,
		)

		expect(fieldValidationService.validateFieldsWithMetadata).toHaveBeenCalledWith(
			{ summary: 'New Issue', description: 'New Description' },
			mockFieldMetadata,
		)
	}, 15000)

	it('should return validation result when validateOnly is true', async () => {
		// Setup validation mock
		const mockValidationResult = {
			isValid: true,
			errors: {},
		}

		;(fieldValidationService.validateFieldsWithMetadata as jest.Mock).mockReturnValue(mockValidationResult)

		// Mock createValidationResponse
		;(fieldProcessorUtils.createValidationResponse as jest.Mock).mockReturnValue({
			success: true,
			message: 'Fields validated successfully',
			isValid: true,
			errors: {},
		})

		// Execute
		const updateFields = {
			fields: {
				summary: 'New Issue',
				description: 'New Description',
			},
			validateOnly: true,
		}

		const result = await processFieldsAndState(mockStateManager, mockJiraConfig, mockWizardStateInfo, updateFields)

		// Verify
		expect(result).toEqual({
			success: true,
			message: 'Fields validated successfully',
			isValid: true,
			errors: {},
		})

		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).toHaveBeenCalledWith(
			'PROJ',
			'project-123',
			'issue-123',
			mockJiraConfig,
		)

		expect(fieldValidationService.validateFieldsWithMetadata).toHaveBeenCalledWith(
			{ summary: 'New Issue', description: 'New Description' },
			mockFieldMetadata,
		)
	}, 15000)

	it('should return error when field validation fails', async () => {
		// Setup validation mock with errors
		const mockValidationResult = {
			isValid: false,
			errors: {
				summary: ['Summary is required'],
			},
		}

		;(fieldValidationService.validateFieldsWithMetadata as jest.Mock).mockReturnValue(mockValidationResult)

		// Mock createProcessErrorResult
		;(utils.createProcessErrorResult as jest.Mock).mockReturnValue({
			success: false,
			message: 'Validation failed for one or more fields',
		})

		// Execute
		const updateFields = {
			fields: {
				summary: '',
				description: 'New Description',
			},
			validateOnly: false,
		}

		const result = await processFieldsAndState(mockStateManager, mockJiraConfig, mockWizardStateInfo, updateFields)

		// Verify
		expect(result).toEqual({
			success: false,
			message: 'Validation failed for one or more fields',
		})

		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).toHaveBeenCalledWith(
			'PROJ',
			'project-123',
			'issue-123',
			mockJiraConfig,
		)

		expect(fieldValidationService.validateFieldsWithMetadata).toHaveBeenCalledWith(
			{ summary: '', description: 'New Description' },
			mockFieldMetadata,
		)
	}, 15000)

	it('should return error when field metadata retrieval fails', async () => {
		// Setup field metadata retrieval failure
		;(categorizeFields.getAndCategorizeFields as jest.Mock).mockResolvedValue({
			success: false,
			error: { message: 'Failed to retrieve field metadata' },
		})

		// Execute
		const updateFields = {
			fields: {
				summary: 'New Issue',
				description: 'New Description',
			},
			validateOnly: false,
		}

		const result = await processFieldsAndState(mockStateManager, mockJiraConfig, mockWizardStateInfo, updateFields)

		// Verify
		expect(result.success).toBe(false)
		expect(result.message).toContain('Failed to retrieve field metadata')

		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).toHaveBeenCalledWith(
			'PROJ',
			'project-123',
			'issue-123',
			mockJiraConfig,
		)
	}, 15000)

	it('should return error when state update fails', async () => {
		// Setup validation mock
		const mockValidationResult = {
			isValid: true,
			errors: {},
		}

		;(fieldValidationService.validateFieldsWithMetadata as jest.Mock).mockReturnValue(mockValidationResult)

		// Mock updateWizardWithFields to return error
		;(fieldProcessorUtils.updateWizardWithFields as jest.Mock).mockReturnValue({
			success: false,
			message: 'Failed to update state',
		})

		// Execute
		const updateFields = {
			fields: {
				summary: 'New Issue',
				description: 'New Description',
			},
			validateOnly: false,
		}

		const result = await processFieldsAndState(mockStateManager, mockJiraConfig, mockWizardStateInfo, updateFields)

		// Verify
		expect(result).toEqual({
			success: false,
			message: 'Failed to update state',
		})

		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).toHaveBeenCalledWith(
			'PROJ',
			'project-123',
			'issue-123',
			mockJiraConfig,
		)

		expect(fieldValidationService.validateFieldsWithMetadata).toHaveBeenCalledWith(
			{ summary: 'New Issue', description: 'New Description' },
			mockFieldMetadata,
		)
	}, 15000)

	it('should handle exceptions and return error result', async () => {
		// Setup project retrieval to throw an exception
		;(projectsApi.getProjectByKey as jest.Mock).mockRejectedValue(new Error('API failed'))

		// Execute
		const updateFields = {
			fields: {
				summary: 'New Issue',
				description: 'New Description',
			},
			validateOnly: false,
		}

		const result = await processFieldsAndState(mockStateManager, mockJiraConfig, mockWizardStateInfo, updateFields)

		// Verify
		expect(result.success).toBe(false)
		expect(result.message).toContain('API failed')

		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
	}, 15000)

	it('should handle non-Error exceptions and return generic error message', async () => {
		// Setup project retrieval to throw a non-Error exception
		;(projectsApi.getProjectByKey as jest.Mock).mockRejectedValue('Non-error rejection')

		// Execute
		const updateFields = {
			fields: {
				summary: 'New Issue',
				description: 'New Description',
			},
			validateOnly: false,
		}

		const result = await processFieldsAndState(mockStateManager, mockJiraConfig, mockWizardStateInfo, updateFields)

		// Verify
		expect(result.success).toBe(false)
		expect(result.message).toContain('Error processing fields: An unknown error occurred')

		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
	}, 15000)

	it('should return error when project retrieval fails', async () => {
		// Override mock for getProjectByKey to return failure
		;(projectsApi.getProjectByKey as jest.Mock).mockResolvedValueOnce({
			success: false,
			error: { message: 'Project not found' },
		})

		// Mock createProcessErrorResult to check its input
		;(utils.createProcessErrorResult as jest.Mock).mockReturnValueOnce({
			success: false,
			message: 'Failed to retrieve project information: Project not found',
		})

		// Execute
		const updateFields = {
			fields: { summary: 'Test' },
			validateOnly: false,
		}

		const result = await processFieldsAndState(mockStateManager, mockJiraConfig, mockWizardStateInfo, updateFields)

		// Verify
		expect(result).toEqual({
			success: false,
			message: 'Failed to retrieve project information: Project not found',
		})
		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).not.toHaveBeenCalled() // Should not proceed to fetch fields
		expect(utils.createProcessErrorResult).toHaveBeenCalledWith(
			'Failed to retrieve project information: Project not found',
		)
	}, 15000)

	it('should return error when updating state with metadata fails', async () => {
		// Setup updateStateWithMetadata mock to return failure
		const mockFailureResult = {
			success: false,
			message: 'Failed to update state with metadata',
		}
		;(updateStateMetadata.updateStateWithMetadata as jest.Mock).mockResolvedValue(mockFailureResult)

		// Execute
		const updateFields = {
			fields: { summary: 'Test' },
			validateOnly: false,
		}

		const result = await processFieldsAndState(mockStateManager, mockJiraConfig, mockWizardStateInfo, updateFields)

		// Verify
		expect(result).toEqual(mockFailureResult)
		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).toHaveBeenCalledWith(
			'PROJ',
			'project-123',
			'issue-123',
			mockJiraConfig,
		)
		expect(updateStateMetadata.updateStateWithMetadata).toHaveBeenCalled()
		// Ensure subsequent steps are not called
		expect(fieldValidationService.validateFieldsWithMetadata).not.toHaveBeenCalled()
		expect(fieldProcessorUtils.updateWizardWithFields).not.toHaveBeenCalled()
	}, 15000)
})
