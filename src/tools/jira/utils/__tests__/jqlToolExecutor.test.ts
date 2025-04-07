import { safeExecute } from '../../../../errors/handlers'
import { ErrorCode } from '../../../../errors/types'
import { log } from '../../../../utils/logger'
import { executeGetIssuesByJqlTool } from '../../executeGetIssuesByJqlTool'
import { getIssuesByJqlToolExecutor } from '../jqlToolExecutor'
import type { ErrorResult } from '../../../../errors/types'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'
import type { ToolResult } from '../../../../types'

// Mock dependencies
jest.mock('../../../../utils/logger', () => ({
	log: jest.fn(),
}))

jest.mock('../../../../errors/handlers', () => {
	const actualModule = jest.requireActual('../../../../errors/handlers')
	return {
		...actualModule,
		safeExecute: jest.fn(),
	}
})

jest.mock('../../executeGetIssuesByJqlTool', () => ({
	executeGetIssuesByJqlTool: jest.fn(),
}))

describe('JQL Tool Executor', () => {
	// Typed mocks
	const mockLog = log as jest.MockedFunction<typeof log>
	const mockSafeExecute = safeExecute as jest.MockedFunction<typeof safeExecute>
	const mockExecuteGetIssuesByJqlTool = executeGetIssuesByJqlTool as jest.MockedFunction<
		typeof executeGetIssuesByJqlTool
	>

	// Test data
	const mockJiraConfig: JiraApiConfig = {
		baseUrl: 'https://test-jira.atlassian.net',
		username: 'test@example.com',
		apiToken: 'test-token',
	}

	const mockSuccessResult: ToolResult = {
		content: [
			{
				type: 'text',
				text: JSON.stringify({ success: true, data: [{ key: 'TEST-1' }] }),
			},
		],
	}

	const mockErrorResult: ErrorResult = {
		success: false,
		error: {
			code: ErrorCode.TOOL_EXECUTION_ERROR,
			message: 'Test error message',
		},
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should log parameters', async () => {
		// Setup
		const executor = getIssuesByJqlToolExecutor(mockJiraConfig)
		const params = { jql: 'project = TEST' }

		mockSafeExecute.mockImplementation(async (callback) => {
			return {
				success: true,
				data: await callback(),
			}
		})

		mockExecuteGetIssuesByJqlTool.mockResolvedValue(mockSuccessResult)

		// Execute
		await executor({ arguments: params })

		// Assert
		expect(mockLog).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(params)))
	})

	it('should transform parameters correctly', async () => {
		// Setup
		const executor = getIssuesByJqlToolExecutor(mockJiraConfig)
		const params = {
			arguments: {
				jql: 'project = TEST',
				startAt: 10,
				maxResults: 25,
			},
		}

		// We need to capture the parameters passed to executeGetIssuesByJqlTool
		// Create a spy function that captures the parameters
		let capturedParams: any = null

		mockExecuteGetIssuesByJqlTool.mockImplementation((wrappedParams) => {
			capturedParams = wrappedParams
			return Promise.resolve(mockSuccessResult)
		})

		mockSafeExecute.mockImplementation(async (callback) => {
			return {
				success: true,
				data: await callback(),
			}
		})

		// Execute
		await executor(params)

		// Assert
		const expectedWrappedParams = {
			arguments: {
				jql: 'project = TEST',
				startAt: 10,
				maxResults: 25,
			},
		}

		expect(capturedParams).toEqual(expectedWrappedParams)
		expect(mockExecuteGetIssuesByJqlTool).toHaveBeenCalledWith(expect.any(Object), mockJiraConfig)
	})

	it('should handle successful execution', async () => {
		// Setup
		const executor = getIssuesByJqlToolExecutor(mockJiraConfig)
		const params = { jql: 'project = TEST' }

		mockSafeExecute.mockResolvedValue({
			success: true,
			data: mockSuccessResult,
		})

		// Execute
		const result = await executor({ arguments: params })

		// Assert
		expect(result).toEqual(mockSuccessResult)
		expect(mockSafeExecute).toHaveBeenCalled()
	})

	it('should handle errors from safeExecute', async () => {
		// Setup
		const executor = getIssuesByJqlToolExecutor(mockJiraConfig)
		const params = { jql: 'project = TEST' }

		mockSafeExecute.mockResolvedValue(mockErrorResult)

		// Execute
		const result = await executor({ arguments: params })

		// Assert
		expect(result).toEqual({
			content: [
				{
					type: 'text',
					text: `Error: ${mockErrorResult.error.message}`,
				},
			],
			isError: true,
		})
	})

	it('should pass through error results', async () => {
		// Setup
		const executor = getIssuesByJqlToolExecutor(mockJiraConfig)
		const params = { jql: 'project = TEST' }

		const customErrorMessage = 'Custom error message'
		mockSafeExecute.mockResolvedValue({
			success: false,
			error: {
				code: ErrorCode.INVALID_PARAMETERS,
				message: customErrorMessage,
			},
		} as ErrorResult)

		// Execute
		const result = await executor({ arguments: params })

		// Assert
		expect(result).toEqual({
			content: [
				{
					type: 'text',
					text: `Error: ${customErrorMessage}`,
				},
			],
			isError: true,
		})
	})
})
