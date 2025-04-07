import * as categorizeFields from '../../../../jira/api/getAndCategorizeFields'
import * as projectsApi from '../../../../jira/api/getProjects'
import { getFieldsWizardToolExecutor } from '../getFieldsExecutor'
import * as utils from '../utils'
import * as wizardStateHelpers from '../wizardStateHelpers'
import type { StateManager } from '../../stateManager'

// Mock dependencies
jest.mock('../utils')
jest.mock('../wizardStateHelpers')
jest.mock('../../../../jira/api/getProjects')
jest.mock('../../../../jira/api/getAndCategorizeFields')
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('getFieldsWizardToolExecutor', () => {
	const mockJiraConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'test@example.com',
		apiToken: 'test-token',
	}

	const mockStateManager = {
		getState: jest.fn(),
		updateState: jest.fn(),
	} as unknown as StateManager

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return error if wizard state is missing', async () => {
		// Setup checkWizardState to return error
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: false,
			errorMessage: 'No active wizard. Initialize one first.',
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: No active wizard. Initialize one first.' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('No active wizard. Initialize one first.')
		expect(categorizeFields.getAndCategorizeFields).not.toHaveBeenCalled()
	})

	it('should return error if state is missing project key or issue type', async () => {
		// Setup checkWizardState to return success but missing projectKey and issueTypeId
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			state: {},
			projectKey: undefined, // Missing project key
			issueTypeId: undefined, // Missing issue type
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Project key or issue type ID is missing' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Project key or issue type ID is missing')
		expect(categorizeFields.getAndCategorizeFields).not.toHaveBeenCalled()
	})

	it('should successfully retrieve field metadata', async () => {
		// Setup checkWizardState with valid state
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			state: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
				fields: {},
			},
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		})

		// Mock getProjectByKey to return success
		;(projectsApi.getProjectByKey as jest.Mock).mockResolvedValue({
			success: true,
			value: { id: 'project-123' },
		})

		// Mock field metadata
		const mockFieldMetadata = {
			required: [{ id: 'summary', name: 'Summary' }],
			optional: [{ id: 'description', name: 'Description' }],
		}

		// Mock getAndCategorizeFields to return success
		;(categorizeFields.getAndCategorizeFields as jest.Mock).mockResolvedValue({
			success: true,
			value: mockFieldMetadata,
		})

		// Mock success result
		const mockSuccessResult = { content: [{ type: 'text', text: JSON.stringify(mockFieldMetadata) }] }
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockSuccessResult)

		// Execute
		const executor = getFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockSuccessResult)
		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).toHaveBeenCalledWith(
			'PROJ',
			'project-123',
			'issue-123',
			mockJiraConfig,
		)
		expect(utils.createSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: 'Fields retrieved successfully',
			fields: mockFieldMetadata,
		})
	})

	it('should return error when project retrieval fails', async () => {
		// Setup checkWizardState with valid state
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			state: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			},
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		})

		// Mock getProjectByKey to return error
		;(projectsApi.getProjectByKey as jest.Mock).mockResolvedValue({
			success: false,
			error: { message: 'Project not found' },
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Failed to retrieve project information: Project not found' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Failed to retrieve project information: Project not found')
		expect(categorizeFields.getAndCategorizeFields).not.toHaveBeenCalled()
	})

	it('should handle field metadata retrieval errors', async () => {
		// Setup checkWizardState with valid state
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			state: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
			},
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		})

		// Mock getProjectByKey to return success
		;(projectsApi.getProjectByKey as jest.Mock).mockResolvedValue({
			success: true,
			value: { id: 'project-123' },
		})

		// Mock getAndCategorizeFields to return error
		;(categorizeFields.getAndCategorizeFields as jest.Mock).mockResolvedValue({
			success: false,
			error: { message: 'Failed to retrieve fields' },
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Failed to retrieve fields: Failed to retrieve fields' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: true } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).toHaveBeenCalledWith(
			'PROJ',
			'project-123',
			'issue-123',
			mockJiraConfig,
		)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Failed to retrieve fields: Failed to retrieve fields')
	})

	it('should handle exceptions and return error result', async () => {
		// Setup mock to throw exception
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Unexpected error: Unexpected error' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Unexpected error: Unexpected error')
	})

	it('should successfully retrieve field metadata when called with no arguments', async () => {
		// Setup checkWizardState with valid state
		;(wizardStateHelpers.checkWizardState as jest.Mock).mockResolvedValue({
			success: true,
			projectKey: 'PROJ',
			issueTypeId: 'issue-123',
		})

		// Mock getProjectByKey to return success
		;(projectsApi.getProjectByKey as jest.Mock).mockResolvedValue({
			success: true,
			value: { id: 'project-123' },
		})

		// Mock field metadata
		const mockFieldMetadata = { required: [], optional: [] }

		// Mock getAndCategorizeFields to return success
		;(categorizeFields.getAndCategorizeFields as jest.Mock).mockResolvedValue({
			success: true,
			value: mockFieldMetadata,
		})

		// Mock success result
		const mockSuccessResult = { content: [{ type: 'text', text: JSON.stringify(mockFieldMetadata) }] }
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockSuccessResult)

		// Execute with type assertion to simulate missing arguments (should trigger || {} fallback)
		const executor = getFieldsWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({} as any)

		// Verify
		expect(result).toBe(mockSuccessResult)
		expect(projectsApi.getProjectByKey).toHaveBeenCalledWith('PROJ', mockJiraConfig)
		expect(categorizeFields.getAndCategorizeFields).toHaveBeenCalledWith(
			'PROJ',
			'project-123',
			'issue-123',
			mockJiraConfig,
		)
		expect(utils.createSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: 'Fields retrieved successfully',
			fields: mockFieldMetadata,
		})
	})
})
