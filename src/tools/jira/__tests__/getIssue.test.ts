import { getIssueByKey } from '../../../jira/api/getIssue'
import { log } from '../../../utils/logger'
import { getIssueTool, getIssueToolExecutor } from '../getIssue'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'

// Mock dependencies
jest.mock('../../../jira/api/getIssue')
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('Jira getIssue Tool', function () {
	// Setup mock Jira configuration
	const mockJiraConfig: JiraApiConfig = {
		baseUrl: 'https://test-jira.atlassian.net',
		username: 'test-user',
		apiToken: 'test-token',
	}

	// Reset mocks after each test
	afterEach(() => {
		jest.resetAllMocks()
	})

	describe('getIssueTool definition', function () {
		it('should have the correct name and description', function () {
			expect(getIssueTool.name).toBe('getJiraIssue')
			expect(getIssueTool.description).toBe('Fetches a Jira issue by its key')
		})

		it('should have required issueKey in input schema', function () {
			expect(getIssueTool.inputSchema).toHaveProperty('properties.issueKey')
			expect(getIssueTool.inputSchema.required).toContain('issueKey')
		})
	})

	describe('getIssueToolExecutor', function () {
		// Create the tool executor
		const executor = getIssueToolExecutor(mockJiraConfig)

		it('should handle successful API response', async function () {
			// Set up mock successful response
			const mockIssue = {
				id: '12345',
				key: 'TEST-123',
				self: 'https://test-jira.atlassian.net/rest/api/3/issue/12345',
				fields: {
					summary: 'Test issue',
				},
			}

			const mockSuccessResponse = {
				success: true,
				data: mockIssue,
			}

			// Mock the getIssueByKey function
			;(getIssueByKey as jest.Mock).mockResolvedValue(mockSuccessResponse)

			// Call the executor with parameters
			const result = await executor({ arguments: { issueKey: 'TEST-123' } })

			// Verify log call
			expect(log).toHaveBeenCalledWith(expect.stringContaining('DEBUG: getJiraIssue tool parameters:'))

			// Verify API call
			expect(getIssueByKey).toHaveBeenCalledWith('TEST-123', mockJiraConfig)

			// Verify result contains the expected data
			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: JSON.stringify(mockSuccessResponse),
					},
				],
			})
		})

		it('should handle API error', async function () {
			// Set up mock error response
			const mockErrorResponse = {
				success: false,
				error: {
					code: 'API_ERROR',
					message: 'Issue not found',
					status: 404,
				},
			}

			// Mock the getIssueByKey function
			;(getIssueByKey as jest.Mock).mockResolvedValue(mockErrorResponse)

			// Call the executor with parameters
			const result = await executor({ arguments: { issueKey: 'INVALID-123' } })

			// Verify log calls
			expect(log).toHaveBeenCalledWith(expect.stringContaining('DEBUG: getJiraIssue tool parameters:'))
			expect(log).toHaveBeenCalledWith(expect.stringContaining('ERROR: Failed to fetch Jira issue:'))

			// Verify result
			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: JSON.stringify(mockErrorResponse),
					},
				],
				isError: true,
			})
		})

		it('should handle missing issueKey parameter', async function () {
			// Call the executor with missing parameter
			const result = await executor({ arguments: {} })

			// Verify log calls
			expect(log).toHaveBeenCalledWith(expect.stringContaining('DEBUG: getJiraIssue tool parameters:'))
			expect(log).toHaveBeenCalledWith('ERROR: Missing or invalid issueKey parameter')

			// Verify result
			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: 'Error: Missing or invalid issueKey parameter',
					},
				],
				isError: true,
			})

			// Verify API was not called
			expect(getIssueByKey).not.toHaveBeenCalled()
		})

		it('should extract issueKey from nested arguments', async function () {
			// Set up mock successful response
			const mockSuccessResponse = {
				success: true,
				data: { id: '12345', key: 'TEST-123' },
			}

			// Mock the getIssueByKey function
			;(getIssueByKey as jest.Mock).mockResolvedValue(mockSuccessResponse)

			// Call the executor with nested arguments (simulating MCP format)
			const result = await executor({ arguments: { issueKey: 'TEST-123' } })

			// Verify API call with correct key
			expect(getIssueByKey).toHaveBeenCalledWith('TEST-123', mockJiraConfig)

			// Verify result
			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: JSON.stringify(mockSuccessResponse),
					},
				],
			})
		})

		it('should handle execution errors', async function () {
			// Mock the getIssueByKey function to throw an error
			;(getIssueByKey as jest.Mock).mockImplementation(() => {
				throw new Error('Execution failed')
			})

			// Call the executor
			const result = await executor({ arguments: { issueKey: 'TEST-123' } })

			// Verify log calls
			expect(log).toHaveBeenCalledWith(expect.stringMatching(/ERROR: .* Execution failed/))

			// Verify result
			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: 'Error: getJiraIssue tool execution failed',
					},
				],
				isError: true,
			})
		})

		it('should handle null parameters', async function () {
			// Call the executor with null parameters
			const result = await executor(null as any)

			// Verify result is an error
			expect(result).toHaveProperty('isError', true)
			expect(result.content[0].text).toMatch(/Error:/)
		})
	})
})
