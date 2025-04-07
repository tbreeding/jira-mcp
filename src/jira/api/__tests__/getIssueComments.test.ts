import { callJiraApi, RestMethod } from '../callJiraApi'
import { getIssueComments } from '../getIssueComments'
import type { IssueCommentResponse } from '../../types/comment'

// Mock dependencies
jest.mock('../callJiraApi')
jest.mock('../../../utils/logger', function () {
	return {
		log: jest.fn(),
	}
})

describe('Jira API - getIssueComments', function () {
	const mockConfig = {
		baseUrl: 'https://test-jira.atlassian.net',
		username: 'test@example.com',
		apiToken: 'test-token',
	}

	const mockIssueKey = 'TEST-123'

	beforeEach(function () {
		jest.clearAllMocks()
	})

	it('should fetch comments successfully', async function () {
		// Mock response data
		const mockComments: IssueCommentResponse = {
			startAt: 0,
			maxResults: 50,
			total: 2,
			comments: [
				{
					id: '10001',
					self: 'https://test-jira.atlassian.net/rest/api/3/issue/TEST-123/comment/10001',
					body: {
						type: 'doc',
						version: 1,
						content: [
							{
								type: 'paragraph',
								content: [
									{
										type: 'text',
										text: 'This is a test comment',
									},
								],
							},
						],
					},
					created: new Date('2023-01-01T12:00:00.000Z'),
					updated: new Date('2023-01-01T12:00:00.000Z'),
					jsdPublic: true,
				},
			],
		}

		// Setup mock implementation
		;(callJiraApi as jest.Mock).mockResolvedValue({
			success: true,
			value: mockComments,
		})

		// Call the function
		const result = await getIssueComments(mockIssueKey, mockConfig)

		// Verify the API was called correctly
		expect(callJiraApi).toHaveBeenCalledWith({
			config: mockConfig,
			endpoint: `/rest/api/3/issue/${mockIssueKey}/comment`,
			method: RestMethod.GET,
		})

		// Verify the result
		expect(result).toEqual({
			success: true,
			value: mockComments,
		})
	})

	it('should handle API error response', async function () {
		// Setup mock implementation for error
		const mockError = {
			success: false,
			error: new Error('Error: Issue does not exist or you do not have permission to see it., Status: 404'),
		}

		;(callJiraApi as jest.Mock).mockResolvedValue(mockError)

		// Call the function
		const result = await getIssueComments(mockIssueKey, mockConfig)

		// Verify the result contains the error
		expect(result).toEqual(mockError)
	})

	it('should handle network errors', async function () {
		// Setup mock implementation for network error
		const mockError = {
			success: false,
			error: new Error('Network error'),
		}

		;(callJiraApi as jest.Mock).mockResolvedValue(mockError)

		// Call the function
		const result = await getIssueComments(mockIssueKey, mockConfig)

		// Verify the result contains the error
		expect(result).toEqual(mockError)
	})
})
