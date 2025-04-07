import { getIssueTypes } from '../../../../jira/api/getIssueTypesFunction'
import { WizardStep } from '../../types'
import { getIssueTypesWizardToolExecutor } from '../getIssueTypesExecutor'
import * as utils from '../utils'
import type { ErrorResult } from '../../../../errors/types'
import type { StateManager } from '../../stateManager'
import type { WizardState } from '../../types'

// Mock dependencies
jest.mock('../utils')
jest.mock('../../../../jira/api/getIssueTypesFunction')
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('getIssueTypesWizardToolExecutor', () => {
	const mockJiraConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'test@example.com',
		apiToken: 'test-token',
	}

	let mockStateManager: jest.Mocked<StateManager>

	beforeEach(() => {
		jest.clearAllMocks()

		// Create mock state manager with Jest mock functions
		mockStateManager = {
			getState: jest.fn(),
			isActive: jest.fn(),
			initializeState: jest.fn(),
			resetState: jest.fn(),
			updateState: jest.fn(),
			serializeState: jest.fn(),
			deserializeState: jest.fn(),
			core: {},
		} as unknown as jest.Mocked<StateManager>
	})

	it('should return error if wizard state has no project key', async () => {
		// Setup mocks with state missing project key
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				// Missing projectKey
				active: true,
				currentStep: WizardStep.PROJECT_SELECTION,
				fields: {},
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
			} as WizardState,
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: No project has been selected. Please select a project first.' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getIssueTypesWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('No project has been selected. Please select a project first.')
		expect(getIssueTypes).not.toHaveBeenCalled()
	})

	it('should return error if wizard state is missing', async () => {
		// Setup mock with missing state
		mockStateManager.getState.mockReturnValue({
			success: false,
			error: { message: 'No active wizard', code: 'NO_ACTIVE_WIZARD' },
		} as ErrorResult)

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Failed to get wizard state: No active wizard' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getIssueTypesWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Failed to get wizard state: No active wizard')
		expect(getIssueTypes).not.toHaveBeenCalled()
	})

	it('should return error if currentStep is before project selection', async () => {
		// Setup mocks with currentStep before PROJECT_SELECTION
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				currentStep: WizardStep.INITIATE, // A step before PROJECT_SELECTION
				active: true,
				fields: {},
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
			} as WizardState,
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Please complete project selection first.' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getIssueTypesWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Please complete project selection first.')
		expect(getIssueTypes).not.toHaveBeenCalled()
	})

	it('should return error if getIssueTypes fails', async () => {
		// Setup mocks
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				active: true,
				currentStep: WizardStep.PROJECT_SELECTION,
				fields: {},
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
			} as WizardState,
		})

		// Mock getIssueTypes failure
		;(getIssueTypes as jest.Mock).mockResolvedValue({
			success: false,
			error: { message: 'Failed to retrieve issue types', code: 'API_ERROR' },
		})

		// Mock error result
		const mockErrorResult = {
			content: [{ type: 'text', text: 'Error: Failed to retrieve issue types: Failed to retrieve issue types' }],
			isError: true,
		}
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getIssueTypesWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: true } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(getIssueTypes).toHaveBeenCalledWith('PROJ', mockJiraConfig, true)
		expect(utils.createErrorResult).toHaveBeenCalledWith(
			'Failed to retrieve issue types: Failed to retrieve issue types',
		)
	})

	it('should successfully retrieve issue types', async () => {
		// Setup mocks
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				active: true,
				currentStep: WizardStep.PROJECT_SELECTION,
				fields: {},
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
			} as WizardState,
		})

		// Mock issue types
		const mockIssueTypes = [
			{ id: 'story-1', name: 'Story', subtask: false },
			{ id: 'bug-1', name: 'Bug', subtask: false },
			{ id: 'task-1', name: 'Task', subtask: false },
		]

		// Mock getIssueTypes success
		;(getIssueTypes as jest.Mock).mockResolvedValue({
			success: true,
			value: mockIssueTypes,
		})

		// Mock success result
		const mockSuccessResult = { content: [{ type: 'text', text: JSON.stringify(mockIssueTypes) }] }
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockSuccessResult)

		// Execute
		const executor = getIssueTypesWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockSuccessResult)
		expect(getIssueTypes).toHaveBeenCalledWith('PROJ', mockJiraConfig, false)
		expect(utils.createSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: 'Retrieved 3 issue types for project PROJ',
			issueTypes: [
				{ id: 'story-1', name: 'Story', subtask: false, description: '', iconUrl: undefined },
				{ id: 'bug-1', name: 'Bug', subtask: false, description: '', iconUrl: undefined },
				{ id: 'task-1', name: 'Task', subtask: false, description: '', iconUrl: undefined },
			],
			projectKey: 'PROJ',
		})
	})

	it('should handle exceptions and return error result', async () => {
		// Setup mock to throw exception
		mockStateManager.getState.mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Mock error result
		const mockErrorResult = { content: [{ type: 'text', text: 'Error: Unexpected error' }], isError: true }
		;(utils.createErrorResult as jest.Mock).mockReturnValue(mockErrorResult)

		// Execute
		const executor = getIssueTypesWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: { forceRefresh: false } })

		// Verify
		expect(result).toBe(mockErrorResult)
		expect(utils.createErrorResult).toHaveBeenCalledWith('Unexpected error')
	})

	it('should successfully retrieve issue types even when arguments are missing', async () => {
		// Setup mocks with valid state
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				active: true,
				currentStep: WizardStep.PROJECT_SELECTION,
				fields: {},
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
			} as WizardState,
		})

		// Mock issue types
		const mockIssueTypes = [{ id: 'task-1', name: 'Task', subtask: false }]

		// Mock getIssueTypes success
		;(getIssueTypes as jest.Mock).mockResolvedValue({
			success: true,
			value: mockIssueTypes,
		})

		// Mock success result
		const mockSuccessResult = { content: [{ type: 'text', text: JSON.stringify(mockIssueTypes) }] }
		;(utils.createSuccessResult as jest.Mock).mockReturnValue(mockSuccessResult)

		// Execute with missing arguments using type assertion
		const executor = getIssueTypesWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({} as any) // Use type assertion here

		// Verify
		expect(result).toBe(mockSuccessResult)
		// Verify getIssueTypes was called with forceRefresh: false (default)
		expect(getIssueTypes).toHaveBeenCalledWith('PROJ', mockJiraConfig, false)
		expect(utils.createSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: 'Retrieved 1 issue types for project PROJ',
			issueTypes: [{ id: 'task-1', name: 'Task', subtask: false, description: '', iconUrl: undefined }],
			projectKey: 'PROJ',
		})
	})
})
