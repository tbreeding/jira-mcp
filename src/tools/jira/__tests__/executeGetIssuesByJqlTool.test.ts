/**
 * Tests for executeGetIssuesByJqlTool function
 */
import { searchIssuesByJql } from '../../../jira/api/searchIssuesByJql'
import { Failure, Success } from '../../../utils/try'
import { executeGetIssuesByJqlTool } from '../executeGetIssuesByJqlTool'
import { mapIssueToEssentialFields } from '../issueMapper'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { JiraIssue } from '../../../jira/types/issue.types'

// Mock dependencies
jest.mock('../../../jira/api/searchIssuesByJql')
jest.mock('../../../utils/logger')
jest.mock('../issueMapper')

// Mock types
const mockSearchIssuesByJql = searchIssuesByJql as jest.MockedFunction<typeof searchIssuesByJql>
const mockMapIssueToEssentialFields = mapIssueToEssentialFields as jest.MockedFunction<typeof mapIssueToEssentialFields>

describe('executeGetIssuesByJqlTool', () => {
	// Mock data
	const mockJiraConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'test',
		apiToken: 'test-token',
	} as JiraApiConfig

	// Create minimal JiraIssue mock that satisfies the interface requirements
	const mockIssues = [
		{
			id: 'ISSUE-123',
			key: 'PROJ-123',
			expand: '',
			self: 'https://jira.example.com/rest/api/3/issue/ISSUE-123',
			changelog: {
				startAt: 0,
				maxResults: 0,
				total: 0,
				histories: [],
			},
			fields: {
				summary: 'Test Issue 1',
			},
		},
		{
			id: 'ISSUE-124',
			key: 'PROJ-124',
			expand: '',
			self: 'https://jira.example.com/rest/api/3/issue/ISSUE-124',
			changelog: {
				startAt: 0,
				maxResults: 0,
				total: 0,
				histories: [],
			},
			fields: {
				summary: 'Test Issue 2',
			},
		},
	] as unknown as JiraIssue[]

	// Mock mapped essential issues with all required fields
	const mockEssentialIssues = [
		{
			id: 'ISSUE-123',
			key: 'PROJ-123',
			summary: 'Test Issue 1',
			status: 'Open',
			issueType: 'Bug',
			priority: 'High',
			assignee: 'Test User',
			reporter: 'Test Reporter',
			created: '2023-01-01T12:00:00.000Z',
			updated: '2023-01-02T12:00:00.000Z',
			sprints: ['Sprint 1'],
		},
		{
			id: 'ISSUE-124',
			key: 'PROJ-124',
			summary: 'Test Issue 2',
			status: 'In Progress',
			issueType: 'Story',
			priority: 'Medium',
			assignee: 'Test User',
			reporter: 'Test Reporter',
			created: '2023-01-01T12:00:00.000Z',
			updated: '2023-01-02T12:00:00.000Z',
			sprints: ['Sprint 1'],
		},
	]

	beforeEach(() => {
		jest.clearAllMocks()

		// Setup mock for mapIssueToEssentialFields
		mockIssues.forEach((issue, index) => {
			mockMapIssueToEssentialFields.mockReturnValueOnce(mockEssentialIssues[index])
		})
	})

	test('should return error when jql parameter is missing', async () => {
		// Call the function with missing jql
		const result = await executeGetIssuesByJqlTool({ arguments: { jql: '' } }, mockJiraConfig)

		// Verify
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: JQL query is required' }],
			isError: true,
		})
		expect(mockSearchIssuesByJql).not.toHaveBeenCalled()
	})

	test('should return error when jql parameter is not a string', async () => {
		// Call the function with non-string jql
		const result = await executeGetIssuesByJqlTool({ arguments: { jql: 123 as any } }, mockJiraConfig)

		// Verify
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: JQL query is required' }],
			isError: true,
		})
		expect(mockSearchIssuesByJql).not.toHaveBeenCalled()
	})

	// Test for the specific branch coverage in lines 32-33
	test('should return error when jql parameter is null', async () => {
		// Call the function with null jql
		const result = await executeGetIssuesByJqlTool({ arguments: { jql: null } }, mockJiraConfig)

		// Verify
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: JQL query is required' }],
			isError: true,
		})
		expect(mockSearchIssuesByJql).not.toHaveBeenCalled()
	})

	// Another test for the specific branch coverage in lines 32-33
	test('should return error when jql parameter is undefined', async () => {
		// Call the function with undefined jql
		const result = await executeGetIssuesByJqlTool({ arguments: {} }, mockJiraConfig)

		// Verify
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: JQL query is required' }],
			isError: true,
		})
		expect(mockSearchIssuesByJql).not.toHaveBeenCalled()
	})

	// Add a test for an object that stringifies to a non-empty string
	// This tests the full branch coverage for the type check part of the condition
	test('should return error when jql parameter is an object that stringifies to a non-empty string', async () => {
		// Create an object that converts to a non-empty string when stringified
		const objectJql = { toString: () => 'some query' }

		// Call the function with the object that stringifies to non-empty
		const result = await executeGetIssuesByJqlTool({ arguments: { jql: objectJql } }, mockJiraConfig)

		// Verify
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: JQL query is required' }],
			isError: true,
		})
		expect(mockSearchIssuesByJql).not.toHaveBeenCalled()
	})

	// Add a test for a falsy value (boolean false)
	test('should return error when jql parameter is boolean false', async () => {
		// Call the function with boolean false as jql
		const result = await executeGetIssuesByJqlTool({ arguments: { jql: false } }, mockJiraConfig)

		// Verify
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: JQL query is required' }],
			isError: true,
		})
		expect(mockSearchIssuesByJql).not.toHaveBeenCalled()
	})

	// Add a test for a truthy non-string value (number)
	test('should return error when jql parameter is a number', async () => {
		// Call the function with a number as jql (truthy but not a string)
		const result = await executeGetIssuesByJqlTool({ arguments: { jql: 42 } }, mockJiraConfig)

		// Verify
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: JQL query is required' }],
			isError: true,
		})
		expect(mockSearchIssuesByJql).not.toHaveBeenCalled()
	})

	test('should return error when API call fails', async () => {
		// Setup mock with error response
		mockSearchIssuesByJql.mockResolvedValue(Failure(new Error('API call failed')))

		// Call the function
		const result = await executeGetIssuesByJqlTool({ arguments: { jql: 'project = PROJ' } }, mockJiraConfig)

		// Verify
		expect(mockSearchIssuesByJql).toHaveBeenCalledWith('project = PROJ', mockJiraConfig, 0, 50)
		expect(result).toEqual({
			content: [{ type: 'text', text: 'Error: API call failed' }],
			isError: true,
		})
	})

	test('should return successful result with default pagination when API call succeeds', async () => {
		// Setup mock with success response
		mockSearchIssuesByJql.mockResolvedValue(
			Success({
				issues: mockIssues,
				total: 2,
				startAt: 0,
				maxResults: 50,
			}),
		)

		// Call the function
		const result = await executeGetIssuesByJqlTool({ arguments: { jql: 'project = PROJ' } }, mockJiraConfig)

		// Verify
		expect(mockSearchIssuesByJql).toHaveBeenCalledWith('project = PROJ', mockJiraConfig, 0, 50)
		expect(mockMapIssueToEssentialFields).toHaveBeenCalledTimes(2)
		expect(result).toEqual({
			content: [
				{
					type: 'text',
					text: JSON.stringify({
						success: true,
						data: mockEssentialIssues,
						pagination: {
							startAt: 0,
							maxResults: 50,
							total: 2,
							currentPage: 1,
							totalPages: 1,
							hasNextPage: false,
							hasPreviousPage: false,
							nextPageStartAt: null,
							previousPageStartAt: null,
						},
					}),
				},
			],
		})
	})

	test('should handle custom pagination parameters', async () => {
		// Setup mock with success response
		mockSearchIssuesByJql.mockResolvedValue(
			Success({
				issues: mockIssues,
				total: 100,
				startAt: 50,
				maxResults: 25,
			}),
		)

		// Call the function with custom pagination
		const result = await executeGetIssuesByJqlTool(
			{ arguments: { jql: 'project = PROJ', startAt: 50, maxResults: 25 } },
			mockJiraConfig,
		)

		// Verify
		expect(mockSearchIssuesByJql).toHaveBeenCalledWith('project = PROJ', mockJiraConfig, 50, 25)
		expect(mockMapIssueToEssentialFields).toHaveBeenCalledTimes(2)
		expect(result).toEqual({
			content: [
				{
					type: 'text',
					text: JSON.stringify({
						success: true,
						data: mockEssentialIssues,
						pagination: {
							startAt: 50,
							maxResults: 25,
							total: 100,
							currentPage: 3,
							totalPages: 4,
							hasNextPage: true,
							hasPreviousPage: true,
							nextPageStartAt: 75,
							previousPageStartAt: 25,
						},
					}),
				},
			],
		})
	})

	test('should handle pagination - first page with more pages available', async () => {
		// Setup mock with success response
		mockSearchIssuesByJql.mockResolvedValue(
			Success({
				issues: mockIssues,
				total: 100,
				startAt: 0,
				maxResults: 10,
			}),
		)

		// Call the function
		const result = await executeGetIssuesByJqlTool(
			{ arguments: { jql: 'project = PROJ', maxResults: 10 } },
			mockJiraConfig,
		)

		// Verify
		expect(mockMapIssueToEssentialFields).toHaveBeenCalledTimes(2)
		expect(result.content[0].text).toContain('"hasNextPage":true')
		expect(result.content[0].text).toContain('"hasPreviousPage":false')
		expect(result.content[0].text).toContain('"nextPageStartAt":10')
		expect(result.content[0].text).toContain('"previousPageStartAt":null')
	})

	test('should handle pagination - last page with previous pages', async () => {
		// Setup mock with success response - last page
		mockSearchIssuesByJql.mockResolvedValue(
			Success({
				issues: mockIssues,
				total: 100,
				startAt: 90,
				maxResults: 10,
			}),
		)

		// Call the function
		const result = await executeGetIssuesByJqlTool(
			{ arguments: { jql: 'project = PROJ', startAt: 90, maxResults: 10 } },
			mockJiraConfig,
		)

		// Verify
		expect(mockMapIssueToEssentialFields).toHaveBeenCalledTimes(2)
		expect(result.content[0].text).toContain('"hasNextPage":true')
		expect(result.content[0].text).toContain('"hasPreviousPage":true')
		expect(result.content[0].text).toContain('"nextPageStartAt":100')
		expect(result.content[0].text).toContain('"previousPageStartAt":80')
	})

	test('should handle pagination - middle page', async () => {
		// Setup mock with success response - middle page
		mockSearchIssuesByJql.mockResolvedValue(
			Success({
				issues: mockIssues,
				total: 100,
				startAt: 50,
				maxResults: 10,
			}),
		)

		// Call the function
		const result = await executeGetIssuesByJqlTool(
			{ arguments: { jql: 'project = PROJ', startAt: 50, maxResults: 10 } },
			mockJiraConfig,
		)

		// Verify
		expect(mockMapIssueToEssentialFields).toHaveBeenCalledTimes(2)
		expect(result.content[0].text).toContain('"hasNextPage":true')
		expect(result.content[0].text).toContain('"hasPreviousPage":true')
		expect(result.content[0].text).toContain('"nextPageStartAt":60')
		expect(result.content[0].text).toContain('"previousPageStartAt":40')
		expect(result.content[0].text).toContain('"currentPage":6')
		expect(result.content[0].text).toContain('"totalPages":10')
	})
})
