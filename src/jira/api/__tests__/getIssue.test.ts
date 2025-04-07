import { Success, Failure } from '../../../utils/try'
import { callJiraApi, RestMethod } from '../callJiraApi'
import { getIssueByKey } from '../getIssue'
import getAllChangeLogsForIssue from '../issueChangeLogs/getAllChangeLogsForIssue'
import type { JiraIssue, IssueChangeLogEntry } from '../../types/issue.types'
import type { JiraApiConfig } from '../apiTypes'

// Mock dependencies
jest.mock('../callJiraApi')
jest.mock('../issueChangeLogs/getAllChangeLogsForIssue')

const mockedCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>
const mockedGetAllChangeLogsForIssue = getAllChangeLogsForIssue as jest.MockedFunction<typeof getAllChangeLogsForIssue>

describe('getIssue', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'testuser',
		apiToken: 'test-token',
	}

	const issueKey = 'TEST-123'

	// Create a partial mock that satisfies the requirements for testing
	const mockIssue = {
		expand: 'expand-string',
		id: '12345',
		self: 'https://jira.example.com/rest/api/3/issue/TEST-123',
		key: issueKey,
		changelog: {
			startAt: 0,
			maxResults: 10,
			total: 10,
			histories: [],
		},
		fields: {
			summary: 'Test Issue',
			status: {
				self: 'status-self',
				description: 'status-description',
				iconUrl: 'status-icon-url',
				name: 'Open',
				id: 'status-id',
				statusCategory: {
					self: 'status-category-self',
					id: 123,
					key: 'status-category-key',
					colorName: 'status-category-color',
					name: 'status-category-name',
				},
			},
			priority: {
				self: 'priority-self',
				iconUrl: 'priority-icon-url',
				name: 'Medium',
				id: 'priority-id',
			},
			issuetype: {
				self: 'issuetype-self',
				id: 'issuetype-id',
				description: 'issuetype-description',
				iconUrl: 'issuetype-icon-url',
				name: 'Story',
				subtask: false,
				avatarId: 10000,
				hierarchyLevel: 0,
			},
			project: {
				self: 'project-self',
				id: 'project-id',
				key: 'TEST',
				name: 'Test Project',
				projectTypeKey: 'project-type-key',
				simplified: true,
				avatarUrls: {},
				projectCategory: {
					self: 'category-self',
					id: 'category-id',
					description: 'category-description',
					name: 'category-name',
				},
			},
			created: '2023-01-01T12:00:00.000Z',
			updated: '2023-01-02T12:00:00.000Z',
			description: {
				version: 1,
				type: 'doc',
				content: [],
			},
			watches: {
				self: 'watches-self',
				watchCount: 1,
				isWatching: false,
			},
			assignee: {
				self: 'assignee-self',
				accountId: 'user-123',
				emailAddress: 'user@example.com',
				avatarUrls: {
					'48x48': 'avatar-url',
					'24x24': 'avatar-url',
					'16x16': 'avatar-url',
					'32x32': 'avatar-url',
				},
				displayName: 'Test User',
				active: true,
				timeZone: 'UTC',
				accountType: 'atlassian',
			},
			statuscategorychangedate: '2023-01-01T12:00:00.000Z',
			progress: {
				progress: 0,
				total: 0,
			},
			votes: {
				self: 'votes-self',
				votes: 0,
				hasVoted: false,
			},
			// Add required fields with null values
			customfield_13100: null,
			customfield_12801: null,
			customfield_14788: null,
			labels: [],
		} as unknown as JiraIssue['fields'],
	} as unknown as JiraIssue

	const mockChangeLogs: IssueChangeLogEntry[] = [
		{
			id: 'changelog-1',
			author: {
				self: 'author-self',
				accountId: 'user-123',
				emailAddress: 'user@example.com',
				avatarUrls: {
					'48x48': 'avatar-url',
					'24x24': 'avatar-url',
					'16x16': 'avatar-url',
					'32x32': 'avatar-url',
				},
				displayName: 'Test User',
				active: true,
				timeZone: 'UTC',
				accountType: 'atlassian',
			},
			created: '2023-01-01T12:00:00.000Z',
			items: [],
		},
	]

	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('getIssueByKey', () => {
		test('should return failure when API call fails', async () => {
			// Setup
			const mockError = new Error('API Error')
			mockedCallJiraApi.mockResolvedValue(Failure(mockError))

			// Execute
			const result = await getIssueByKey(issueKey, mockConfig)

			// Verify
			expect(mockedCallJiraApi).toHaveBeenCalledWith({
				config: mockConfig,
				endpoint: `/rest/api/3/issue/${issueKey}?expand=changelog`,
				method: RestMethod.GET,
			})
			expect(result.success).toBe(false)
			expect(result.error).toEqual(mockError)
			expect(mockedGetAllChangeLogsForIssue).not.toHaveBeenCalled()
		})

		test('should return issue when changelog is complete', async () => {
			// Setup
			mockedCallJiraApi.mockResolvedValue(Success(mockIssue))

			// Execute
			const result = await getIssueByKey(issueKey, mockConfig)

			// Verify
			expect(mockedCallJiraApi).toHaveBeenCalledWith({
				config: mockConfig,
				endpoint: `/rest/api/3/issue/${issueKey}?expand=changelog`,
				method: RestMethod.GET,
			})
			expect(result.success).toBe(true)
			expect(result.value).toEqual(mockIssue)
			expect(mockedGetAllChangeLogsForIssue).not.toHaveBeenCalled()
		})

		test('should fetch all changelogs when initial changelog is incomplete', async () => {
			// Setup
			const incompleteIssue = {
				...mockIssue,
				changelog: {
					startAt: 0,
					maxResults: 5,
					total: 10,
					histories: [],
				},
			}

			mockedCallJiraApi.mockResolvedValue(Success(incompleteIssue))
			mockedGetAllChangeLogsForIssue.mockResolvedValue(Success(mockChangeLogs))

			// Execute
			const result = await getIssueByKey(issueKey, mockConfig)

			// Verify
			expect(mockedCallJiraApi).toHaveBeenCalledWith({
				config: mockConfig,
				endpoint: `/rest/api/3/issue/${issueKey}?expand=changelog`,
				method: RestMethod.GET,
			})
			expect(mockedGetAllChangeLogsForIssue).toHaveBeenCalledWith(issueKey, mockConfig)

			expect(result.success).toBe(true)
			expect(result.value).toEqual({
				...incompleteIssue,
				changelog: {
					startAt: 0,
					maxResults: mockChangeLogs.length,
					total: mockChangeLogs.length,
					histories: mockChangeLogs,
				},
			})
		})

		test('should return failure when getAllChangeLogsForIssue fails', async () => {
			// Setup
			const incompleteIssue = {
				...mockIssue,
				changelog: {
					startAt: 0,
					maxResults: 5,
					total: 10,
					histories: [],
				},
			}

			const changeLogError = new Error('Failed to fetch changelogs')

			mockedCallJiraApi.mockResolvedValue(Success(incompleteIssue))
			mockedGetAllChangeLogsForIssue.mockResolvedValue(Failure(changeLogError))

			// Execute
			const result = await getIssueByKey(issueKey, mockConfig)

			// Verify
			expect(mockedCallJiraApi).toHaveBeenCalledWith({
				config: mockConfig,
				endpoint: `/rest/api/3/issue/${issueKey}?expand=changelog`,
				method: RestMethod.GET,
			})
			expect(mockedGetAllChangeLogsForIssue).toHaveBeenCalledWith(issueKey, mockConfig)

			expect(result.success).toBe(false)
			expect(result.error).toEqual(changeLogError)
		})
	})

	describe('hasCompleteChangeLog', () => {
		test('should not fetch all changelogs when total equals maxResults', async () => {
			// Setup
			const completeChangelogIssue = {
				...mockIssue,
				changelog: {
					startAt: 0,
					maxResults: 10,
					total: 10,
					histories: [],
				},
			}

			// Execute
			mockedCallJiraApi.mockResolvedValue(Success(completeChangelogIssue))
			await getIssueByKey(issueKey, mockConfig)

			// Verify
			expect(mockedGetAllChangeLogsForIssue).not.toHaveBeenCalled()
		})

		test('should fetch all changelogs when total is greater than maxResults', async () => {
			// Setup
			const incompleteChangelogIssue = {
				...mockIssue,
				changelog: {
					startAt: 0,
					maxResults: 5,
					total: 10,
					histories: [],
				},
			}

			// Execute
			mockedCallJiraApi.mockResolvedValue(Success(incompleteChangelogIssue))
			mockedGetAllChangeLogsForIssue.mockResolvedValue(Success([]))
			await getIssueByKey(issueKey, mockConfig)

			// Verify
			expect(mockedGetAllChangeLogsForIssue).toHaveBeenCalled()
		})
	})
})
