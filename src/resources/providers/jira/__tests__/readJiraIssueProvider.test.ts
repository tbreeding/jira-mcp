import { readJiraIssueProvider } from '../readJiraIssueProvider'
import { getIssueByKey } from '../../../../jira/api/getIssue' // Mock the correct API function
import { Failure, Success } from '../../../../utils/try'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'
import type { ResourceProviderContext } from '../../../types/resource.types'

// Mock dependencies
jest.mock('../../../../jira/api/getIssue', () => ({
	getIssueByKey: jest.fn(),
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

describe('readJiraIssueProvider', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should successfully fetch and return Jira issue data when config is provided', async () => {
		// Mock data
		const issueKey = 'TEST-123'
		const uri = `jira://instance/issue/${issueKey}`
		const mockIssueData = { id: '10001', key: issueKey, fields: { summary: 'Test issue' } }
		const mockSuccessTry = Success(mockIssueData)

		// Configure mocks
		;(getIssueByKey as jest.Mock).mockResolvedValue(mockSuccessTry)

		// Call the provider with context
		const result = await readJiraIssueProvider(uri, mockContextWithConfig)

		// Verify results
		expect(getIssueByKey).toHaveBeenCalledWith(issueKey, mockJiraConfig) // Check config is passed
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data).toEqual({
				content: JSON.stringify(mockIssueData, null, 2),
				mimeType: 'application/json',
			})
		}
	})

	it('should return an error when getIssueByKey returns Failure', async () => {
		// Mock data
		const issueKey = 'TEST-404'
		const uri = `jira://instance/issue/${issueKey}`
		const mockError = new Error('Issue not found')
		const mockFailureTry = Failure(mockError)

		// Configure mock implementation to return a Promise resolving to Failure
		;(getIssueByKey as jest.Mock).mockImplementation(() => {
			return Promise.resolve(mockFailureTry)
		})

		// Call the provider with context
		const result = await readJiraIssueProvider(uri, mockContextWithConfig)

		// Verify results
		expect(getIssueByKey).toHaveBeenCalledWith(issueKey, mockJiraConfig)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe(mockError)
		}
	})

	it('should return an error when jiraConfig is missing from context', async () => {
		const issueKey = 'TEST-789'
		const uri = `jira://instance/issue/${issueKey}`

		// Call the provider with context missing the config
		const result = await readJiraIssueProvider(uri, mockContextWithoutConfig)

		// Verify results
		expect(getIssueByKey).not.toHaveBeenCalled()
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error?.message).toContain('Jira API configuration missing')
		}
	})

	it('should return an error when URI format is invalid', async () => {
		// Invalid URI formats
		const invalidURIs = [
			'jira://instance/invalid-path',
			'jira://instance/issues/no-key', // Missing 'issue/' path
			'jira://instance/issue/', // Missing key
		]

		for (const uri of invalidURIs) {
			// Call the provider
			const result = await readJiraIssueProvider(uri, mockContextWithConfig)

			// Verify results
			expect(getIssueByKey).not.toHaveBeenCalled()
			expect(result.success).toBe(false)
			expect((result as any).error.message).toContain('Invalid Jira issue URI format')
			expect((result as any).error.message).toContain(uri)

			// Reset mock between iterations
			jest.clearAllMocks()
		}
	})

	it('should correctly extract issue key and call getIssueByKey', async () => {
		// Test various URI formats that should work
		const testCases = [
			{ uri: 'jira://instance/issue/TEST-123', expectedKey: 'TEST-123' },
			{ uri: 'jira://instance/issue/ABC-1', expectedKey: 'ABC-1' },
			{ uri: 'jira://otherinstance/issue/XYZ-999', expectedKey: 'XYZ-999' },
		]

		const mockSuccessTry = Success({ key: 'mock', fields: {} })
		;(getIssueByKey as jest.Mock).mockResolvedValue(mockSuccessTry)

		for (const { uri, expectedKey } of testCases) {
			await readJiraIssueProvider(uri, mockContextWithConfig) // Pass context
			expect(getIssueByKey).toHaveBeenCalledWith(expectedKey, mockJiraConfig) // Check config
			jest.clearAllMocks()
		}
	})
})
