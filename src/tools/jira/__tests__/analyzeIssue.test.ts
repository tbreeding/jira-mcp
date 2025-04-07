import { ErrorCode, type ErrorResult } from '../../../errors/types'
import { getIssueByKey } from '../../../jira/api/getIssue'
import { getIssueComments } from '../../../jira/api/getIssueComments'
import { analyzeIssue } from '../../../jira/services/analyzeIssue/analyzeIssue'
import { log } from '../../../utils/logger'
import { analyzeIssueTool, getAnalyzeIssueToolExecutor } from '../analyzeIssue'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'

// Mock dependencies
jest.mock('../../../jira/api/getIssue')
jest.mock('../../../jira/api/getIssueComments')
jest.mock('../../../jira/services/analyzeIssue/analyzeIssue')
jest.mock('../../../utils/logger')

const mockGetIssueByKey = getIssueByKey as jest.Mock
const mockGetIssueComments = getIssueComments as jest.Mock
const mockAnalyzeIssue = analyzeIssue as jest.Mock
const mockLog = log as jest.Mock

describe('analyzeIssueTool', () => {
	it('should have correct name and description', () => {
		expect(analyzeIssueTool.name).toBe('analyzeJiraIssue')
		expect(analyzeIssueTool.description).toBe('Performs comprehensive analysis of a Jira issue')
		expect(analyzeIssueTool.inputSchema.required).toContain('issueKey')
	})

	describe('getAnalyzeIssueToolExecutor', () => {
		const mockJiraConfig: JiraApiConfig = {
			baseUrl: 'https://jira.example.com',
			username: 'test-user',
			apiToken: 'test-token',
		}

		const mockIssue = {
			key: 'TEST-123',
			fields: {
				summary: 'Test Issue',
				issuetype: { name: 'Bug' },
			},
		}

		const mockComments = {
			comments: [],
			startAt: 0,
			maxResults: 50,
			total: 0,
		}

		const mockAnalysisResult = {
			issueKey: 'TEST-123',
			summary: 'Test Issue',
			issueType: 'Bug',
			metadata: { metadataResult: 'test' },
		}

		beforeEach(() => {
			// Clear all mocks
			jest.clearAllMocks()

			// Mock successful responses
			mockGetIssueByKey.mockResolvedValue({
				success: true,
				value: mockIssue,
			})
			mockGetIssueComments.mockResolvedValue({
				success: true,
				value: mockComments,
			})
			mockAnalyzeIssue.mockReturnValue(mockAnalysisResult)
		})

		it('should return analysis result when everything succeeds', async () => {
			// Arrange
			const executor = getAnalyzeIssueToolExecutor(mockJiraConfig)

			// Act
			const result = await executor({ arguments: { issueKey: 'TEST-123' } })

			// Assert
			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: JSON.stringify({
							success: true,
							data: mockAnalysisResult,
						}),
					},
				],
			})

			expect(mockGetIssueByKey).toHaveBeenCalledWith('TEST-123', mockJiraConfig)
			expect(mockGetIssueComments).toHaveBeenCalledWith('TEST-123', mockJiraConfig)
			expect(mockAnalyzeIssue).toHaveBeenCalledWith(mockIssue, mockComments)
			expect(mockLog).toHaveBeenCalled()
		})

		it('should handle issue retrieval error', async () => {
			// Arrange
			mockGetIssueByKey.mockResolvedValue({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: 'Issue not found',
				},
			} as ErrorResult)

			const executor = getAnalyzeIssueToolExecutor(mockJiraConfig)

			// Act
			const result = await executor({ arguments: { issueKey: 'TEST-123' } })

			// Assert
			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: 'Error: Issue not found',
					},
				],
				isError: true,
			})
		})

		it('should handle comments retrieval error', async () => {
			// Arrange
			mockGetIssueComments.mockResolvedValue({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: 'Comments not available',
				},
			} as ErrorResult)

			const executor = getAnalyzeIssueToolExecutor(mockJiraConfig)

			// Act
			const result = await executor({ arguments: { issueKey: 'TEST-123' } })

			// Assert
			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: 'Error: Comments not available',
					},
				],
				isError: true,
			})
		})

		it('should handle unexpected errors during execution', async () => {
			// Arrange
			mockAnalyzeIssue.mockImplementation(() => {
				throw new Error('Unexpected error')
			})

			const executor = getAnalyzeIssueToolExecutor(mockJiraConfig)

			// Act
			const result = await executor({ arguments: { issueKey: 'TEST-123' } })

			// Assert
			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: 'Error: analyzeJiraIssue tool execution failed',
					},
				],
				isError: true,
			})
		})
	})
})
