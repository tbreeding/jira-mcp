import { Failure, Success } from '../../../../utils/try'
import { callJiraApi, RestMethod } from '../../callJiraApi'
import createGetIssueChangeLogs from '../createGetIssueChangeLogs'
import type { IssueChangeLogResponseBody } from '../../../types/issue.types'
import type { JiraApiConfig } from '../../apiTypes'

// Mock the callJiraApi function
jest.mock('../../callJiraApi')
const mockedCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>

describe('createGetIssueChangeLogs', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'testuser',
		apiToken: 'test-token',
	}

	const issueIdOrKey = 'TEST-123'
	const mockResponse: IssueChangeLogResponseBody = {
		self: 'https://jira.example.com/rest/api/3/issue/TEST-123/changelog',
		values: [],
		startAt: 0,
		maxResults: 50,
		total: 0,
		isLast: true,
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return successful response when API call succeeds', async () => {
		// Setup
		mockedCallJiraApi.mockResolvedValue(Success(mockResponse))

		// Execute
		const getIssueChangeLogs = createGetIssueChangeLogs(mockConfig, issueIdOrKey)
		const result = await getIssueChangeLogs()

		// Verify
		expect(mockedCallJiraApi).toHaveBeenCalledWith({
			endpoint: `/rest/api/3/issue/${issueIdOrKey}/changelog?maxResults=50&startAt=0`,
			method: RestMethod.GET,
			config: mockConfig,
		})
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockResponse)
	})

	test('should return failure when API call fails', async () => {
		// Setup
		const mockError = new Error('API Error')
		mockedCallJiraApi.mockResolvedValue(Failure(mockError))

		// Execute
		const getIssueChangeLogs = createGetIssueChangeLogs(mockConfig, issueIdOrKey)
		const result = await getIssueChangeLogs()

		// Verify
		expect(result.success).toBe(false)
		expect(result.error).toEqual(mockError)
	})

	test('should use custom startAt and maxResults parameters when provided', async () => {
		// Setup
		mockedCallJiraApi.mockResolvedValue(Success(mockResponse))
		const customStartAt = 10
		const customMaxResults = 25

		// Execute
		const getIssueChangeLogs = createGetIssueChangeLogs(mockConfig, issueIdOrKey)
		await getIssueChangeLogs(customStartAt, customMaxResults)

		// Verify
		expect(mockedCallJiraApi).toHaveBeenCalledWith({
			endpoint: `/rest/api/3/issue/${issueIdOrKey}/changelog?maxResults=${customMaxResults}&startAt=${customStartAt}`,
			method: RestMethod.GET,
			config: mockConfig,
		})
	})
})
