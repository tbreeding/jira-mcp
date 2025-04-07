/**
 * Tests for the Issue Creation Wizard Tool Integration
 *
 * This module contains tests for the Issue Creation Wizard tool integration.
 * It verifies that tools are properly exported, executors are correctly wrapped
 * with error handling, and that both success and error cases are handled properly.
 */

import * as errorHandlers from '../../../../errors/handlers'
import { ErrorCode } from '../../../../errors/types'
import * as createIssueExecutor from '../createIssueExecutor'
import * as getStateExecutor from '../getStateExecutor'
import * as getStatusExecutor from '../getStatusExecutor'
import { issueCreationWizardTools, getIssueCreationWizardToolExecutors } from '../index'
import * as resetStateExecutor from '../resetStateExecutor'
import * as updateStateExecutor from '../updateStateExecutor'
import { wrapExecutorWithErrorHandling } from '../wrapExecutorWithErrorHandling'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'
import type { ToolExecutor, ToolResult } from '../../../../types'
import type { StateManager } from '../../stateManager'

// Mock dependencies
jest.mock('../getStateExecutor')
jest.mock('../getStatusExecutor')
jest.mock('../resetStateExecutor')
jest.mock('../updateStateExecutor')
jest.mock('../createIssueExecutor')
jest.mock('../../../../errors/handlers')
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('Issue Creation Wizard Tool Integration', () => {
	// Mock Jira API config for testing
	const mockJiraConfig: JiraApiConfig = {
		baseUrl: 'https://test.atlassian.net',
		username: 'test-user',
		apiToken: 'test-token',
	}

	// Mock StateManager
	const mockStateManager: StateManager = {
		getState: jest.fn(),
		core: {},
	} as unknown as StateManager

	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('Tool Definitions', () => {
		it('should export all tool definitions', () => {
			expect(issueCreationWizardTools).toHaveProperty('getStateWizardTool')
			expect(issueCreationWizardTools).toHaveProperty('getStatusWizardTool')
			expect(issueCreationWizardTools).toHaveProperty('resetStateWizardTool')
			expect(issueCreationWizardTools).toHaveProperty('updateStateWizardTool')
			expect(issueCreationWizardTools).toHaveProperty('createIssueWizardTool')
		})
	})

	describe('Tool Executors', () => {
		it('should export all tool executors', () => {
			const executors = getIssueCreationWizardToolExecutors(mockJiraConfig, mockStateManager)

			expect(executors).toHaveProperty('getStateWizardToolExecutor')
			expect(executors).toHaveProperty('getStatusWizardToolExecutor')
			expect(executors).toHaveProperty('resetStateWizardToolExecutor')
			expect(executors).toHaveProperty('updateStateWizardToolExecutor')
			expect(executors).toHaveProperty('createIssueWizardToolExecutor')
		})

		it('should wrap each executor with error handling', () => {
			// Mock each executor factory to return a simple function
			jest.spyOn(getStateExecutor, 'getStateWizardToolExecutor').mockReturnValue(jest.fn())
			jest.spyOn(getStatusExecutor, 'getStatusWizardToolExecutor').mockReturnValue(jest.fn())
			jest.spyOn(resetStateExecutor, 'resetStateWizardToolExecutor').mockReturnValue(jest.fn())
			jest.spyOn(updateStateExecutor, 'updateStateWizardToolExecutor').mockReturnValue(jest.fn())
			jest.spyOn(createIssueExecutor, 'createIssueWizardToolExecutor').mockReturnValue(jest.fn())

			getIssueCreationWizardToolExecutors(mockJiraConfig, mockStateManager)

			// Verify each executor was properly wrapped
			expect(getStateExecutor.getStateWizardToolExecutor).toHaveBeenCalledWith(mockStateManager)
			expect(getStatusExecutor.getStatusWizardToolExecutor).toHaveBeenCalledWith(mockStateManager)
			expect(resetStateExecutor.resetStateWizardToolExecutor).toHaveBeenCalledWith(mockStateManager)
			expect(updateStateExecutor.updateStateWizardToolExecutor).toHaveBeenCalledWith(mockStateManager, mockJiraConfig)
			expect(createIssueExecutor.createIssueWizardToolExecutor).toHaveBeenCalledWith(mockStateManager, mockJiraConfig)
		})
	})

	describe('Error Handler Wrapper', () => {
		it('should handle successful execution', async () => {
			// Create a mock executor that returns a success response
			const mockSuccessResult: ToolResult = {
				content: [{ type: 'text', text: 'success data' }],
			}
			const mockExecutor: ToolExecutor = jest.fn().mockResolvedValue(mockSuccessResult)

			// Mock safeExecute to return success
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: true,
				data: mockSuccessResult,
			})

			// Create wrapped executor and call it
			const wrappedExecutor = wrapExecutorWithErrorHandling(mockExecutor)
			const result = await wrappedExecutor({ arguments: { testParam: 'value' } })

			// Verify safeExecute was called with the right parameters
			expect(errorHandlers.safeExecute).toHaveBeenCalledWith(
				expect.any(Function),
				'Issue Creation Wizard tool execution failed',
				ErrorCode.TOOL_EXECUTION_ERROR,
			)

			// Verify the result matches the expected success result
			expect(result).toEqual(mockSuccessResult)
		})

		it('should handle execution errors', async () => {
			// Create a mock executor
			const mockExecutor: ToolExecutor = jest.fn()

			// Mock safeExecute to return an error
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: 'Test error message',
					metadata: {},
				},
			})

			// Create wrapped executor and call it
			const wrappedExecutor = wrapExecutorWithErrorHandling(mockExecutor)
			const result = await wrappedExecutor({ arguments: { testParam: 'value' } })

			// Verify safeExecute was called
			expect(errorHandlers.safeExecute).toHaveBeenCalled()

			// Verify the error result is formatted correctly
			expect(result.isError).toBe(true)
			expect(result.content[0].type).toBe('text')
			expect(result.content[0].text).toBe('Error: Test error message')
		})

		it('should handle errors with undefined message', async () => {
			// Create a mock executor
			const mockExecutor: ToolExecutor = jest.fn()

			// Mock safeExecute to return an error with undefined message
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: undefined as unknown as string,
					metadata: {},
				},
			})

			// Create wrapped executor and call it
			const wrappedExecutor = wrapExecutorWithErrorHandling(mockExecutor)
			const result = await wrappedExecutor({ arguments: { testParam: 'value' } })

			// Verify the error result contains the undefined message
			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: undefined')
		})

		it('should handle errors with null message', async () => {
			// Create a mock executor
			const mockExecutor: ToolExecutor = jest.fn()

			// Mock safeExecute to return an error with null message
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: null as unknown as string,
					metadata: {},
				},
			})

			// Create wrapped executor and call it
			const wrappedExecutor = wrapExecutorWithErrorHandling(mockExecutor)
			const result = await wrappedExecutor({ arguments: { testParam: 'value' } })

			// Verify the error result contains the null message
			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: null')
		})

		it('should handle case where error property is completely missing', async () => {
			// Create a mock executor
			const mockExecutor: ToolExecutor = jest.fn()

			// Mock safeExecute to return a failure without an error property
			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue({
				success: false,
				// error property is missing completely
			} as any)

			// Create wrapped executor and call it
			const wrappedExecutor = wrapExecutorWithErrorHandling(mockExecutor)
			const result = await wrappedExecutor({ arguments: { testParam: 'value' } })

			// Verify the error result contains undefined message
			expect(result.isError).toBe(true)
			expect(result.content[0].text).toBe('Error: undefined')
		})

		it('should verify that the callback passed to safeExecute calls the executor', async () => {
			// Create a mock executor that we can verify is called
			const mockExecutor: ToolExecutor = jest.fn().mockResolvedValue('test result')
			const mockParams = { test: 'params' }

			// Mock safeExecute to actually call the callback function
			jest.spyOn(errorHandlers, 'safeExecute').mockImplementation(async (callbackFn) => {
				// Call the callback to test that it calls our executor with the params
				await callbackFn()

				// Return a success response
				return { success: true, data: 'test-result' }
			})

			// Create and execute the wrapped executor
			const wrappedExecutor = wrapExecutorWithErrorHandling(mockExecutor)
			await wrappedExecutor({ arguments: mockParams })

			// Verify that the executor was called by the callback
			expect(mockExecutor).toHaveBeenCalledWith({ arguments: mockParams })
		})
	})
})
