/**
 * Unit tests for Update Issue From State Tool Executor
 *
 * Tests the updateIssueFromStateToolExecutor function which
 * creates an executor that updates a Jira issue from the current state.
 */

import { updateIssueFromStateToolExecutor } from '../updateIssueFromStateExecutor'
import { updateIssueFromState } from '../../operations/updateIssueOrchestrator'
import { createSuccessResult, createErrorResult } from '../../../issueCreationWizard/mcp/utils'
import { Success, Failure } from '../../../../utils/try'
import type { StateManager } from '../../../issueCreationWizard/stateManager'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'

// Mock dependencies
jest.mock('../../operations/updateIssueOrchestrator')
jest.mock('../../../issueCreationWizard/mcp/utils')

describe('updateIssueFromStateToolExecutor', () => {
	// Mock implementations
	const mockUpdateIssueFromState = updateIssueFromState as jest.MockedFunction<typeof updateIssueFromState>
	const mockCreateSuccessResult = createSuccessResult as jest.MockedFunction<typeof createSuccessResult>
	const mockCreateErrorResult = createErrorResult as jest.MockedFunction<typeof createErrorResult>

	// Mock state manager and Jira config
	const mockStateManager = {} as StateManager
	const mockJiraConfig = {} as JiraApiConfig

	// Mock success and error responses
	const mockSuccessResponse = { content: [{ type: 'text', text: 'success' }] }
	const mockErrorResponse = {
		content: [{ type: 'text', text: 'Error: Something went wrong' }],
		isError: true,
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return success result when update operation succeeds', async () => {
		// Arrange
		const issueKey = 'TEST-123'
		mockUpdateIssueFromState.mockResolvedValue(Success(issueKey))
		mockCreateSuccessResult.mockReturnValue(mockSuccessResponse)

		// Act
		const executor = updateIssueFromStateToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Assert
		expect(mockUpdateIssueFromState).toHaveBeenCalledWith(mockStateManager, mockJiraConfig)
		expect(mockCreateSuccessResult).toHaveBeenCalledWith({
			success: true,
			message: `Successfully updated issue ${issueKey}`,
			issueKey,
		})
		expect(result).toBe(mockSuccessResponse)
	})

	test('should return error result when update operation fails', async () => {
		// Arrange
		const errorMessage = 'Update failed'
		mockUpdateIssueFromState.mockResolvedValue(Failure(new Error(errorMessage)))
		mockCreateErrorResult.mockReturnValue(mockErrorResponse)

		// Act
		const executor = updateIssueFromStateToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Assert
		expect(mockUpdateIssueFromState).toHaveBeenCalledWith(mockStateManager, mockJiraConfig)
		expect(mockCreateErrorResult).toHaveBeenCalledWith(errorMessage)
		expect(result).toBe(mockErrorResponse)
	})

	test('should return error result when update operation throws exception', async () => {
		// Arrange
		const exceptionMessage = 'Unexpected error'
		mockUpdateIssueFromState.mockRejectedValue(new Error(exceptionMessage))
		mockCreateErrorResult.mockReturnValue(mockErrorResponse)

		// Act
		const executor = updateIssueFromStateToolExecutor(mockStateManager, mockJiraConfig)
		const result = await executor({ arguments: {} })

		// Assert
		expect(mockUpdateIssueFromState).toHaveBeenCalledWith(mockStateManager, mockJiraConfig)
		expect(mockCreateErrorResult).toHaveBeenCalledWith(exceptionMessage)
		expect(result).toBe(mockErrorResponse)
	})
})
