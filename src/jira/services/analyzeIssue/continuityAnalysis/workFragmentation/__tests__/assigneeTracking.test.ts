import { getCurrentAssignee } from '../assigneeTracking'
import type { JiraIssue, IssueChangeLogEntry } from '../../../../../types/issue.types'

describe('assigneeTracking', () => {
	describe('getCurrentAssignee', () => {
		test('should return assignee from most recent change before timestamp', () => {
			// Arrange
			const histories: IssueChangeLogEntry[] = [
				{
					id: '1',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-02T00:00:00.000Z',
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: 'user1',
							fromString: 'User 1',
							to: 'user2',
							toString: 'User 2',
						},
					],
				},
				{
					id: '2',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-01T00:00:00.000Z',
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: null,
							fromString: null,
							to: 'user1',
							toString: 'User 1',
						},
					],
				},
				{
					id: '3',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-03T00:00:00.000Z',
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: 'user2',
							fromString: 'User 2',
							to: 'user3',
							toString: 'User 3',
						},
					],
				},
			]

			const issue = {
				id: '12345',
				key: 'TEST-123',
				changelog: {
					startAt: 0,
					maxResults: 100,
					total: 3,
					histories: histories,
				},
				fields: {
					assignee: {
						displayName: 'User Current',
					},
				},
			} as unknown as JiraIssue

			// Act - query for a timestamp between entry 2 and 3
			const result = getCurrentAssignee(issue, '2023-01-02T12:00:00.000Z')

			// Assert
			expect(result).toBe('User 2')
		})

		test('should return current assignee when no changes before timestamp', () => {
			// Arrange
			const issue = {
				id: '12345',
				key: 'TEST-123',
				changelog: {
					startAt: 0,
					maxResults: 100,
					total: 0,
					histories: [],
				},
				fields: {
					assignee: {
						displayName: 'User Current',
					},
				},
			} as unknown as JiraIssue

			// Act
			const result = getCurrentAssignee(issue, '2023-01-01T00:00:00.000Z')

			// Assert
			expect(result).toBe('User Current')
		})

		test('should return null when current assignee is null and no changes', () => {
			// Arrange
			const issue = {
				id: '12345',
				key: 'TEST-123',
				changelog: {
					startAt: 0,
					maxResults: 100,
					total: 0,
					histories: [],
				},
				fields: {
					assignee: null,
				},
			} as unknown as JiraIssue

			// Act
			const result = getCurrentAssignee(issue, '2023-01-01T00:00:00.000Z')

			// Assert
			expect(result).toBeNull()
		})

		test('should filter only changes before the target time', () => {
			// Arrange
			const histories: IssueChangeLogEntry[] = [
				{
					id: '1',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-02T00:00:00.000Z',
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: 'user1',
							fromString: 'User 1',
							to: 'user2',
							toString: 'User 2',
						},
					],
				},
				{
					id: '2',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-03T00:00:00.000Z',
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: 'user2',
							fromString: 'User 2',
							to: 'user3',
							toString: 'User 3',
						},
					],
				},
			]

			const issue = {
				id: '12345',
				key: 'TEST-123',
				changelog: {
					startAt: 0,
					maxResults: 100,
					total: 2,
					histories: histories,
				},
				fields: {
					assignee: {
						displayName: 'User Current',
					},
				},
			} as unknown as JiraIssue

			// Act - query for a timestamp before all changes
			const result = getCurrentAssignee(issue, '2023-01-01T00:00:00.000Z')

			// Assert
			expect(result).toBe('User Current')
		})

		test('should select the most recent change when multiple assignee changes exist', () => {
			// Arrange
			const histories: IssueChangeLogEntry[] = [
				{
					id: '1',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-01T00:00:00.000Z',
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: null,
							fromString: null,
							to: 'user1',
							toString: 'User 1',
						},
					],
				},
				{
					id: '2',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-01T06:00:00.000Z',
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: 'user1',
							fromString: 'User 1',
							to: 'user2',
							toString: 'User 2',
						},
					],
				},
				{
					id: '3',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-01T12:00:00.000Z',
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: 'user2',
							fromString: 'User 2',
							to: 'user3',
							toString: 'User 3',
						},
					],
				},
			]

			const issue = {
				id: '12345',
				key: 'TEST-123',
				changelog: {
					startAt: 0,
					maxResults: 100,
					total: 3,
					histories: histories,
				},
				fields: {
					assignee: {
						displayName: 'User Current',
					},
				},
			} as unknown as JiraIssue

			// Act - query for a timestamp after all changes
			const result = getCurrentAssignee(issue, '2023-01-02T00:00:00.000Z')

			// Assert
			expect(result).toBe('User 3')
		})

		test('should handle changes that match exactly the timestamp', () => {
			// Arrange
			const timestamp = '2023-01-01T00:00:00.000Z'
			const histories: IssueChangeLogEntry[] = [
				{
					id: '1',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: timestamp, // Exact same timestamp we're querying for
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: null,
							fromString: null,
							to: 'user1',
							toString: 'User 1',
						},
					],
				},
			]

			const issue = {
				id: '12345',
				key: 'TEST-123',
				changelog: {
					startAt: 0,
					maxResults: 100,
					total: 1,
					histories: histories,
				},
				fields: {
					assignee: {
						displayName: 'User Current',
					},
				},
			} as unknown as JiraIssue

			// Act
			const result = getCurrentAssignee(issue, timestamp)

			// Assert
			expect(result).toBe('User 1')
		})

		test('should ignore non-assignee changes', () => {
			// Arrange
			const histories: IssueChangeLogEntry[] = [
				{
					id: '1',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-01T00:00:00.000Z',
					items: [
						{
							field: 'status',
							fieldtype: 'jira',
							fieldId: 'status',
							from: null,
							fromString: null,
							to: '1',
							toString: 'To Do',
						},
					],
				},
			]

			const issue = {
				id: '12345',
				key: 'TEST-123',
				changelog: {
					startAt: 0,
					maxResults: 100,
					total: 1,
					histories: histories,
				},
				fields: {
					assignee: {
						displayName: 'User Current',
					},
				},
			} as unknown as JiraIssue

			// Act
			const result = getCurrentAssignee(issue, '2023-01-02T00:00:00.000Z')

			// Assert
			expect(result).toBe('User Current') // Should fall back to current assignee
		})

		test('should handle mixed assignee and non-assignee changes', () => {
			// Arrange
			const histories: IssueChangeLogEntry[] = [
				{
					id: '1',
					author: {
						self: 'http://jira/user/1',
						accountId: 'user1',
						avatarUrls: {},
						displayName: 'User 1',
						active: true,
						timeZone: 'UTC',
						accountType: 'atlassian',
					},
					created: '2023-01-01T00:00:00.000Z',
					items: [
						{
							field: 'status',
							fieldtype: 'jira',
							fieldId: 'status',
							from: null,
							fromString: null,
							to: '1',
							toString: 'To Do',
						},
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: null,
							fromString: null,
							to: 'user1',
							toString: 'User 1',
						},
					],
				},
			]

			const issue = {
				id: '12345',
				key: 'TEST-123',
				changelog: {
					startAt: 0,
					maxResults: 100,
					total: 1,
					histories: histories,
				},
				fields: {
					assignee: {
						displayName: 'User Current',
					},
				},
			} as unknown as JiraIssue

			// Act
			const result = getCurrentAssignee(issue, '2023-01-02T00:00:00.000Z')

			// Assert
			expect(result).toBe('User 1')
		})
	})
})
