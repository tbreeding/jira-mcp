import { findFieldChangesBefore, extractFieldValueFromChange } from '../changelogProcessing'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('changelogProcessing', () => {
	// Create a valid mock author object
	const mockAuthor = {
		self: 'https://jira.example.com/rest/api/2/user?accountId=123',
		accountId: '123456789',
		emailAddress: 'test@example.com',
		avatarUrls: {
			'16x16': 'https://avatar.example.com/small',
			'24x24': 'https://avatar.example.com/medium',
			'32x32': 'https://avatar.example.com/large',
			'48x48': 'https://avatar.example.com/xlarge',
		},
		displayName: 'Test User',
		active: true,
		timeZone: 'UTC',
		accountType: 'atlassian',
	}

	// Create a complete changelog item template
	const createChangeLogItem = (field: string, fromString: string | null, toString: string | null) => ({
		field,
		fieldtype: 'jira',
		fieldId: field.toLowerCase(),
		from: null,
		fromString,
		to: null,
		toString,
	})

	describe('findFieldChangesBefore', () => {
		test('should find and sort changelog entries for a field before a given time', () => {
			// Setup
			const mockIssue = {
				changelog: {
					histories: [
						{
							id: '1',
							created: '2023-01-01T10:00:00.000Z',
							items: [createChangeLogItem('status', 'To Do', 'In Progress')],
							author: mockAuthor,
						},
						{
							id: '2',
							created: '2023-01-02T15:00:00.000Z',
							items: [createChangeLogItem('status', 'In Progress', 'Done')],
							author: mockAuthor,
						},
						{
							id: '3',
							created: '2023-01-03T09:00:00.000Z',
							items: [createChangeLogItem('assignee', 'User A', 'User B')],
							author: mockAuthor,
						},
					],
				},
			} as unknown as JiraIssue

			const targetTime = new Date('2023-01-02T16:00:00.000Z').getTime()

			// Execute
			const result = findFieldChangesBefore(mockIssue, targetTime, 'status')

			// Verify
			expect(result).toHaveLength(2)
			// Check that the result is sorted with most recent first
			expect(result[0].id).toBe('2')
			expect(result[1].id).toBe('1')
		})

		test('should return empty array when no changes match the criteria', () => {
			// Setup
			const mockIssue = {
				changelog: {
					histories: [
						{
							id: '1',
							created: '2023-01-03T10:00:00.000Z',
							items: [createChangeLogItem('status', 'To Do', 'In Progress')],
							author: mockAuthor,
						},
					],
				},
			} as unknown as JiraIssue

			const targetTime = new Date('2023-01-01T00:00:00.000Z').getTime() // Before any changes

			// Execute
			const result = findFieldChangesBefore(mockIssue, targetTime, 'status')

			// Verify
			expect(result).toEqual([])
		})

		test('should handle case where issue.changelog is undefined', () => {
			// Setup
			const mockIssue = {} as unknown as JiraIssue
			const targetTime = new Date('2023-01-01T00:00:00.000Z').getTime()

			// Execute
			const result = findFieldChangesBefore(mockIssue, targetTime, 'status')

			// Verify
			expect(result).toEqual([])
		})

		test('should handle case where issue.changelog.histories is undefined', () => {
			// Setup
			const mockIssue = {
				changelog: {},
			} as unknown as JiraIssue
			const targetTime = new Date('2023-01-01T00:00:00.000Z').getTime()

			// Execute
			const result = findFieldChangesBefore(mockIssue, targetTime, 'status')

			// Verify
			expect(result).toEqual([])
		})
	})

	describe('extractFieldValueFromChange', () => {
		test('should extract field value from history entry', () => {
			// Setup
			const historyEntry = {
				id: '1',
				created: '2023-01-01T10:00:00.000Z',
				items: [
					createChangeLogItem('status', 'To Do', 'In Progress'),
					createChangeLogItem('assignee', 'User A', 'User B'),
				],
				author: mockAuthor,
			}

			// Execute
			const result = extractFieldValueFromChange(historyEntry, 'status')

			// Verify
			expect(result).toBe('In Progress')
		})

		test('should return null when field is not found in history entry', () => {
			// Setup
			const historyEntry = {
				id: '1',
				created: '2023-01-01T10:00:00.000Z',
				items: [createChangeLogItem('assignee', 'User A', 'User B')],
				author: mockAuthor,
			}

			// Execute
			const result = extractFieldValueFromChange(historyEntry, 'status')

			// Verify
			expect(result).toBeNull()
		})

		test('should return null when fieldItem has no toString property', () => {
			// Setup - explicitly testing line 38 branch
			const historyEntry = {
				id: '1',
				created: '2023-01-01T10:00:00.000Z',
				items: [
					{
						field: 'status',
						fieldtype: 'jira',
						fieldId: 'status',
						from: null,
						fromString: 'To Do',
						to: null,
						toString: null, // Now explicitly set to null to test the branch
					},
				],
				author: mockAuthor,
			} as unknown as JiraIssue['changelog']['histories'][0]

			// Execute
			const result = extractFieldValueFromChange(historyEntry, 'status')

			// Verify
			expect(result).toBeNull()
		})
	})
})
