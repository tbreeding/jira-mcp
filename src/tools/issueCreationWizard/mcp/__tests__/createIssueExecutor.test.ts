import { createIssue } from '../../../../jira/api/createIssue'
import { WizardStep } from '../../types'
import { formatFieldsForSubmission } from '../../utils/adfFormatter'
import { createIssueWizardToolExecutor } from '../createIssueExecutor'
import type { ErrorResult } from '../../../../errors/types'
import type { StateManager } from '../../stateManager'
import type { WizardState } from '../../types'

// Mock dependencies
jest.mock('../../../../jira/api/createIssue')
jest.mock('../../utils/adfFormatter')
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('createIssueWizardToolExecutor', () => {
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
			updateState: jest.fn().mockReturnValue({ success: true }),
			serializeState: jest.fn(),
			deserializeState: jest.fn(),
			core: {},
		} as unknown as jest.Mocked<StateManager>
		;(formatFieldsForSubmission as jest.Mock).mockImplementation((data) => data)
	})

	it('should return error if no active wizard found', async () => {
		// Setup mock
		mockStateManager.getState.mockReturnValue({
			success: false,
			error: { message: 'No active wizard', code: 'NO_ACTIVE_WIZARD' },
		} as ErrorResult)

		// Execute
		const executor = createIssueWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: No active issue creation wizard found')
	})

	it('should return error if project or issue type is missing', async () => {
		// Setup mock with missing project key
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				issueTypeId: 'issue-123',
				// projectKey is missing
				active: true,
				currentStep: WizardStep.PROJECT_SELECTION,
				fields: {},
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
			} as WizardState,
		})

		// Execute
		const executor = createIssueWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: Project and issue type are required for issue creation')

		// Setup mock with missing issue type
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				// issueTypeId is missing
				active: true,
				currentStep: WizardStep.ISSUE_TYPE_SELECTION,
				fields: {},
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
			} as WizardState,
		})

		// Execute again
		const result2 = await executor({ arguments: {} })

		// Verify
		expect(result2.isError).toBe(true)
		expect(result2.content[0].text).toBe('Error: Project and issue type are required for issue creation')
	})

	it('should return error if analysis is not complete', async () => {
		// Setup mock with analysis not complete
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				fields: { summary: 'Test issue' },
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
				analysisComplete: false, // Analysis not complete
				userConfirmation: true,
			} as WizardState,
		})

		// Execute
		const executor = createIssueWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe(
			'Error: Issue analysis must be completed before creating the issue. Please run analysis first.',
		)
	})

	it('should return error if user confirmation is not obtained', async () => {
		// Setup mock with user confirmation not provided
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				fields: { summary: 'Test issue' },
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
				analysisComplete: true,
				userConfirmation: false, // User has not confirmed
			} as WizardState,
		})

		// Execute
		const executor = createIssueWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe(
			"Error: User confirmation is required before creating the issue. Please ask the user if it's OK to proceed.",
		)
	})

	it('should return error if createIssue fails', async () => {
		// Setup mocks
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
				summary: 'Test issue',
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				fields: { summary: 'Test issue' },
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
				analysisComplete: true, // Add this field
				userConfirmation: true, // Add this field
			} as WizardState,
		})

		// Mock createIssue to fail
		;(createIssue as jest.Mock).mockResolvedValue({
			success: false,
			error: { message: 'API error', code: 'API_ERROR' },
		})

		// Execute
		const executor = createIssueWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: Failed to create issue: API error')
		expect(createIssue).toHaveBeenCalledWith(
			mockJiraConfig,
			expect.objectContaining({
				summary: 'Test issue',
				project: { key: 'PROJ' },
				issuetype: { name: 'Task' },
			}),
		)
	})

	it('should successfully create an issue and return details', async () => {
		// Setup mocks
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
				summary: 'Test issue',
				description: 'Test description',
				active: true,
				currentStep: WizardStep.SUBMISSION,
				fields: {
					summary: 'Test issue',
					description: 'Test description',
				},
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
				analysisComplete: true, // Add this field
				userConfirmation: true, // Add this field
			} as WizardState,
		})

		// Mock successful issue creation
		;(createIssue as jest.Mock).mockResolvedValue({
			success: true,
			value: {
				key: 'PROJ-123',
				id: '456',
			},
		})

		// Execute
		const executor = createIssueWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBeUndefined()

		// Get the data from the JSON string in the result
		const responseData = JSON.parse(result.content[0].text)
		expect(responseData).toEqual({
			success: true,
			issueKey: 'PROJ-123',
			summary: 'Test issue',
			url: 'https://jira.example.com/browse/PROJ-123',
		})

		// Verify createIssue was called with correct parameters
		expect(createIssue).toHaveBeenCalledWith(
			mockJiraConfig,
			expect.objectContaining({
				summary: 'Test issue',
				description: 'Test description',
				project: { key: 'PROJ' },
				issuetype: { name: 'Task' },
			}),
		)
	})

	it('should handle exceptions and return error result', async () => {
		// Setup mock to throw exception
		mockStateManager.getState.mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Execute
		const executor = createIssueWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: Unexpected error during issue creation: Unexpected error')
	})

	it('should handle state update failure after successful issue creation', async () => {
		// Setup mocks
		mockStateManager.getState.mockReturnValue({
			success: true,
			data: {
				projectKey: 'PROJ',
				issueTypeId: 'issue-123',
				summary: 'Test issue',
				description: 'Test description',
				active: true,
				currentStep: WizardStep.SUBMISSION,
				fields: {
					summary: 'Test issue',
					description: 'Test description',
				},
				validation: { errors: {}, warnings: {} },
				timestamp: 123456789,
				analysisComplete: true,
				userConfirmation: true,
			} as WizardState,
		})

		// Mock successful issue creation
		;(createIssue as jest.Mock).mockResolvedValue({
			success: true,
			value: {
				key: 'PROJ-123',
				id: '456',
			},
		})

		// Mock state update failure
		mockStateManager.updateState.mockReturnValueOnce({
			success: false,
			error: { message: 'Failed to update state', code: 'STATE_UPDATE_ERROR' },
		})

		// Execute
		const executor = createIssueWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBeUndefined()
		expect(mockStateManager.updateState).toHaveBeenCalledWith({
			issueKey: 'PROJ-123',
			mode: 'updating',
		})

		// Verify that the issue was still created successfully despite the state update failure
		const responseData = JSON.parse(result.content[0].text)
		expect(responseData).toEqual({
			success: true,
			issueKey: 'PROJ-123',
			summary: 'Test issue',
			url: 'https://jira.example.com/browse/PROJ-123',
		})
	})

	// Test for the specific branch coverage in lines 48-49
	it('should handle non-Error objects in catch block', async () => {
		// Setup mock to throw a non-Error object
		mockStateManager.getState.mockImplementation(() => {
			throw 'String error message'
		})

		// Execute
		const executor = createIssueWizardToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Verify
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toBe('Error: Unexpected error during issue creation: String error message')
	})
})
