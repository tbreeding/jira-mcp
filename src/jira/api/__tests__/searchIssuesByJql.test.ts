import { Success, Failure } from '../../../utils/try'
import { callJiraApi, RestMethod } from '../callJiraApi'
import { searchIssuesByJql } from '../searchIssuesByJql'
import type { JiraIssue } from '../../types/issue.types'
import type { JiraApiConfig } from '../apiTypes'

// Mock dependencies
jest.mock('../callJiraApi')
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

const mockedCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>

describe('searchIssuesByJql', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'testuser',
		apiToken: 'test-token',
	}

	const mockJqlQuery = 'project = TEST AND status = "In Progress"'
	const encodedMockJql = encodeURIComponent(mockJqlQuery)

	// Create mock issue for testing
	const mockIssue: JiraIssue = {
		id: '12345',
		self: 'https://jira.example.com/rest/api/3/issue/TEST-123',
		key: 'TEST-123',
		expand: '',
		fields: {
			summary: 'Test Issue',
			status: {
				self: 'status-self',
				description: 'status-description',
				iconUrl: 'status-icon-url',
				name: 'In Progress',
				id: 'status-id',
				statusCategory: {
					self: 'status-category-self',
					id: 123,
					key: 'status-category-key',
					colorName: 'status-category-color',
					name: 'status-category-name',
				},
			},
			issuetype: {
				self: 'issuetype-self',
				id: 'issuetype-id',
				description: 'issuetype-description',
				iconUrl: 'issuetype-icon-url',
				name: 'Story',
				subtask: false,
				avatarId: 0,
				hierarchyLevel: 0,
			},
			project: {
				self: 'project-self',
				id: 'project-id',
				key: 'TEST',
				name: 'Test Project',
				projectTypeKey: 'software',
				simplified: false,
				avatarUrls: {},
			},
		},
	} as JiraIssue

	const mockSearchResponse = {
		startAt: 0,
		maxResults: 50,
		total: 1,
		issues: [mockIssue],
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return search results on successful API call with default parameters', async () => {
		// Setup
		mockedCallJiraApi.mockResolvedValue(Success(mockSearchResponse))

		// Execute
		const result = await searchIssuesByJql(mockJqlQuery, mockConfig)

		// Verify
		expect(mockedCallJiraApi).toHaveBeenCalledWith({
			config: mockConfig,
			endpoint: `/rest/api/3/search?jql=${encodedMockJql}&startAt=0&maxResults=50`,
			method: RestMethod.GET,
		})
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockSearchResponse)
	})

	test('should return search results on successful API call with custom parameters', async () => {
		// Setup
		const customStartAt = 10
		const customMaxResults = 25
		mockedCallJiraApi.mockResolvedValue(
			Success({
				...mockSearchResponse,
				startAt: customStartAt,
				maxResults: customMaxResults,
			}),
		)

		// Execute
		const result = await searchIssuesByJql(mockJqlQuery, mockConfig, customStartAt, customMaxResults)

		// Verify
		expect(mockedCallJiraApi).toHaveBeenCalledWith({
			config: mockConfig,
			endpoint: `/rest/api/3/search?jql=${encodedMockJql}&startAt=${customStartAt}&maxResults=${customMaxResults}`,
			method: RestMethod.GET,
		})
		expect(result.success).toBe(true)
		expect(result.value).toEqual({
			...mockSearchResponse,
			startAt: customStartAt,
			maxResults: customMaxResults,
		})
	})

	test('should return failure when API call fails', async () => {
		// Setup
		const mockError = new Error('API Error')
		mockedCallJiraApi.mockResolvedValue(Failure(mockError))

		// Execute
		const result = await searchIssuesByJql(mockJqlQuery, mockConfig)

		// Verify
		expect(mockedCallJiraApi).toHaveBeenCalledWith({
			config: mockConfig,
			endpoint: `/rest/api/3/search?jql=${encodedMockJql}&startAt=0&maxResults=50`,
			method: RestMethod.GET,
		})
		expect(result.success).toBe(false)
		expect(result.error).toEqual(mockError)
	})

	test('should handle empty results correctly', async () => {
		// Setup
		const emptyResponse = {
			startAt: 0,
			maxResults: 50,
			total: 0,
			issues: [],
		}
		mockedCallJiraApi.mockResolvedValue(Success(emptyResponse))

		// Execute
		const result = await searchIssuesByJql(mockJqlQuery, mockConfig)

		// Verify
		expect(mockedCallJiraApi).toHaveBeenCalledWith({
			config: mockConfig,
			endpoint: `/rest/api/3/search?jql=${encodedMockJql}&startAt=0&maxResults=50`,
			method: RestMethod.GET,
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.value).toEqual(emptyResponse)
			expect(result.value.issues).toHaveLength(0)
		}
	})

	test('should handle complex JQL queries with special characters', async () => {
		// Setup
		const complexJql = 'project = TEST AND status = "In Progress" AND summary ~ "Special & characters"'
		const encodedComplexJql = encodeURIComponent(complexJql)
		mockedCallJiraApi.mockResolvedValue(Success(mockSearchResponse))

		// Execute
		const result = await searchIssuesByJql(complexJql, mockConfig)

		// Verify
		expect(mockedCallJiraApi).toHaveBeenCalledWith({
			config: mockConfig,
			endpoint: `/rest/api/3/search?jql=${encodedComplexJql}&startAt=0&maxResults=50`,
			method: RestMethod.GET,
		})
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockSearchResponse)
	})
})
