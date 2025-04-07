import { readJiraSearchProvider } from '../readJiraSearchProvider'
import { searchIssuesByJql } from '../../../../jira/api/searchIssuesByJql'
import { Failure, Success } from '../../../../utils/try'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'
import type { ResourceProviderContext } from '../../../types/resource.types'

// Mock dependencies
jest.mock('../../../../jira/api/searchIssuesByJql', () => ({
	searchIssuesByJql: jest.fn(),
}))

// Mock Jira Config
const mockJiraConfig: JiraApiConfig = {
	baseUrl: 'https://mock.jira.com',
	username: 'mockuser',
	apiToken: 'mocktoken',
}

// Mock Context
const mockContextWithConfig: ResourceProviderContext = {
	jiraConfig: mockJiraConfig,
}

const mockContextWithoutConfig: ResourceProviderContext = {}

describe('readJiraSearchProvider', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should successfully fetch and return Jira search results when config is provided', async () => {
		// Mock data
		const jql = 'project = TEST'
		const uri = `jira://instance/search?jql=${encodeURIComponent(jql)}`
		const mockSearchData = { startAt: 0, maxResults: 50, total: 2, issues: [{ key: 'TEST-123' }, { key: 'TEST-456' }] }
		const mockSuccessTry = Success(mockSearchData)

		// Configure mocks
		;(searchIssuesByJql as jest.Mock).mockResolvedValue(mockSuccessTry)

		// Call the provider with context
		const result = await readJiraSearchProvider(uri, mockContextWithConfig)

		// Verify results
		expect(searchIssuesByJql).toHaveBeenCalledWith(jql, mockJiraConfig)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data).toEqual({
				content: JSON.stringify(mockSearchData, null, 2),
				mimeType: 'application/json',
			})
		}
	})

	it('should return an error when searchIssuesByJql returns Failure', async () => {
		// Mock data
		const jql = 'invalidJql'
		const uri = `jira://instance/search?jql=${encodeURIComponent(jql)}`
		const mockError = new Error('Invalid JQL syntax')
		const mockFailureTry = Failure(mockError)

		// Configure mock implementation to return a Promise resolving to Failure
		;(searchIssuesByJql as jest.Mock).mockImplementation(() => {
			return Promise.resolve(mockFailureTry)
		})

		// Call the provider with context
		const result = await readJiraSearchProvider(uri, mockContextWithConfig)

		// Verify results
		expect(searchIssuesByJql).toHaveBeenCalledWith(jql, mockJiraConfig)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe(mockError)
		}
	})

	it('should return an error when jiraConfig is missing from context', async () => {
		const jql = 'project=ANY'
		const uri = `jira://instance/search?jql=${encodeURIComponent(jql)}`

		// Call the provider with context missing the config
		const result = await readJiraSearchProvider(uri, mockContextWithoutConfig)

		// Verify results
		expect(searchIssuesByJql).not.toHaveBeenCalled()
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error?.message).toContain('Jira API configuration missing')
		}
	})

	it('should return an error when jql parameter is missing', async () => {
		// URIs missing jql parameter
		const invalidURIs = ['jira://instance/search', 'jira://instance/search?', 'jira://instance/search?other=param']

		for (const uri of invalidURIs) {
			// Call the provider
			const result = await readJiraSearchProvider(uri, mockContextWithConfig)

			// Verify results
			expect(searchIssuesByJql).not.toHaveBeenCalled()
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error.message).toContain('Invalid or incomplete Jira search URI')
				expect(result.error.message).toContain(uri)
			}

			// Reset mock between iterations
			jest.clearAllMocks()
		}
	})

	it('should handle URL parsing errors', async () => {
		// Invalid URL that will cause URL constructor to throw
		const invalidURI = '://invalid-uri'

		// Call the provider
		const result = await readJiraSearchProvider(invalidURI, mockContextWithConfig)

		// Verify results
		expect(searchIssuesByJql).not.toHaveBeenCalled()
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.message).toContain('Invalid or incomplete Jira search URI')
			expect(result.error.message).toContain(invalidURI)
		}
	})

	it('should correctly extract JQL and call searchIssuesByJql', async () => {
		// Test various URI formats that should work
		const testCases = [
			{
				uri: 'jira://instance/search?jql=project%20%3D%20TEST',
				expectedJql: 'project = TEST',
			},
			{
				uri: 'jira://instance/search?jql=project%3DDEMO%20AND%20status%3D%22In%20Progress%22',
				expectedJql: 'project=DEMO AND status="In Progress"',
			},
			{
				uri: 'jira://otherinstance/search?jql=assignee%3Dcurrentuser()',
				expectedJql: 'assignee=currentuser()',
			},
		]

		const mockSuccessTry = Success({ issues: [] })
		;(searchIssuesByJql as jest.Mock).mockResolvedValue(mockSuccessTry)

		for (const { uri, expectedJql } of testCases) {
			await readJiraSearchProvider(uri, mockContextWithConfig)
			expect(searchIssuesByJql).toHaveBeenCalledWith(expectedJql, mockJiraConfig)
			jest.clearAllMocks()
		}
	})
})
