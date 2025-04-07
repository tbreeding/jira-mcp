/**
 * Tests for executeAnalyzeIssueTool function
 */
import { getIssueByKey } from '../../../jira/api/getIssue'
import { getIssueComments } from '../../../jira/api/getIssueComments'
import { analyzeIssue } from '../../../jira/services/analyzeIssue/analyzeIssue'
import { executeAnalyzeIssueTool } from '../executeAnalyzeIssueTool'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { JiraIssue } from '../../../jira/types/issue.types'

// Mock dependencies
jest.mock('../../../jira/api/getIssue')
jest.mock('../../../jira/api/getIssueComments')
jest.mock('../../../jira/services/analyzeIssue/analyzeIssue')
jest.mock('../../../utils/logger')

// Mock types
const mockGetIssueByKey = getIssueByKey as jest.MockedFunction<typeof getIssueByKey>
const mockGetIssueComments = getIssueComments as jest.MockedFunction<typeof getIssueComments>
const mockAnalyzeIssue = analyzeIssue as jest.MockedFunction<typeof analyzeIssue>

describe('executeAnalyzeIssueTool', () => {
	// Mock data
	const mockIssue = { id: 'ISSUE-123', fields: { summary: 'Test Issue' } } as unknown as JiraIssue
	const mockComments = { comments: [{ id: 'COMMENT-1', body: 'Test comment' }] } as any
	const mockAnalysisResult = { quality: 'Good', metrics: { score: 90 } } as any
	const mockJiraConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'test',
		apiToken: 'test-token',
	} as JiraApiConfig

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return successful result when everything works', async () => {
		// Setup mocks with Try structure
		mockGetIssueByKey.mockResolvedValue({
			success: true,
			value: mockIssue,
		})

		mockGetIssueComments.mockResolvedValue({
			success: true,
			value: mockComments,
		})

		mockAnalyzeIssue.mockReturnValue(mockAnalysisResult)

		// Call the function
		const result = await executeAnalyzeIssueTool({ arguments: { issueKey: 'ISSUE-123' } }, mockJiraConfig)

		// Verify
		expect(mockGetIssueByKey).toHaveBeenCalledWith('ISSUE-123', mockJiraConfig)
		expect(mockGetIssueComments).toHaveBeenCalledWith('ISSUE-123', mockJiraConfig)
		expect(mockAnalyzeIssue).toHaveBeenCalledWith(mockIssue, mockComments)
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
	})

	test('should return error when getIssueByKey fails', async () => {
		// Setup mocks with Try structure
		mockGetIssueByKey.mockResolvedValue({
			success: false,
			error: new Error('Failed to get issue'),
		})

		// Call the function
		const result = await executeAnalyzeIssueTool({ arguments: { issueKey: 'ISSUE-123' } }, mockJiraConfig)

		// Verify
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: Failed to get issue' }],
			isError: true,
		})
		expect(mockAnalyzeIssue).not.toHaveBeenCalled()
	})

	test('should return error when getIssueComments fails', async () => {
		// Setup mocks with Try structure
		mockGetIssueByKey.mockResolvedValue({
			success: true,
			value: mockIssue,
		})

		mockGetIssueComments.mockResolvedValue({
			success: false,
			error: new Error('Failed to get comments'),
		})

		// Call the function
		const result = await executeAnalyzeIssueTool({ arguments: { issueKey: 'ISSUE-123' } }, mockJiraConfig)

		// Verify
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: Failed to get comments' }],
			isError: true,
		})
		expect(mockAnalyzeIssue).not.toHaveBeenCalled()
	})
})
