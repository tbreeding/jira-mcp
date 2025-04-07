import * as changelogProcessing from '../changelogProcessing'
import { getCurrentStatusAtTime, getCurrentAssigneeAtTime } from '../contextTracking'
import type { JiraIssue, IssueChangeLogEntry } from '../../../../../types/issue.types'

// Mock dependencies
jest.mock('../changelogProcessing', () => ({
	findFieldChangesBefore: jest.fn(),
	extractFieldValueFromChange: jest.fn(),
}))

describe('contextTracking', () => {
	// Create a valid mock author object for changelog entries
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

	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('getCurrentStatusAtTime', () => {
		test('should return status from changelog when available', () => {
			// Setup
			const mockIssue = {
				fields: {
					status: { name: 'Current Status' },
				},
			} as unknown as JiraIssue

			const mockStatusChanges = [
				{
					id: '1',
					created: '2023-01-01T10:00:00.000Z',
					author: mockAuthor,
					items: [
						{
							field: 'status',
							fieldtype: 'jira',
							fieldId: 'status',
							from: null,
							fromString: 'To Do',
							to: null,
							toString: 'In Progress',
						},
					],
				},
			] as IssueChangeLogEntry[]

			jest.spyOn(changelogProcessing, 'findFieldChangesBefore').mockReturnValue(mockStatusChanges)
			jest.spyOn(changelogProcessing, 'extractFieldValueFromChange').mockReturnValue('Previous Status')

			// Execute
			const result = getCurrentStatusAtTime(mockIssue, '2023-01-02T10:00:00.000Z')

			// Verify
			expect(changelogProcessing.findFieldChangesBefore).toHaveBeenCalledWith(
				mockIssue,
				new Date('2023-01-02T10:00:00.000Z').getTime(),
				'status',
			)
			expect(changelogProcessing.extractFieldValueFromChange).toHaveBeenCalledWith(mockStatusChanges[0], 'status')
			expect(result).toBe('Previous Status')
		})

		test('should return current status when no status changes found in changelog', () => {
			// Setup
			const mockIssue = {
				fields: {
					status: { name: 'Current Status' },
				},
			} as unknown as JiraIssue

			jest.spyOn(changelogProcessing, 'findFieldChangesBefore').mockReturnValue([])

			// Execute
			const result = getCurrentStatusAtTime(mockIssue, '2023-01-02T10:00:00.000Z')

			// Verify
			expect(changelogProcessing.findFieldChangesBefore).toHaveBeenCalledWith(
				mockIssue,
				new Date('2023-01-02T10:00:00.000Z').getTime(),
				'status',
			)
			expect(changelogProcessing.extractFieldValueFromChange).not.toHaveBeenCalled()
			expect(result).toBe('Current Status')
		})

		test('should return null when status field is missing', () => {
			// Setup - testing line 23 branch
			const mockIssue = {
				fields: {
					// No status field
				},
			} as unknown as JiraIssue

			jest.spyOn(changelogProcessing, 'findFieldChangesBefore').mockReturnValue([])

			// Execute
			const result = getCurrentStatusAtTime(mockIssue, '2023-01-02T10:00:00.000Z')

			// Verify
			expect(result).toBeNull()
		})
	})

	describe('getCurrentAssigneeAtTime', () => {
		test('should return assignee from changelog when available', () => {
			// Setup
			const mockIssue = {
				fields: {
					assignee: { displayName: 'Current Assignee' },
				},
			} as unknown as JiraIssue

			const mockAssigneeChanges = [
				{
					id: '1',
					created: '2023-01-01T10:00:00.000Z',
					author: mockAuthor,
					items: [
						{
							field: 'assignee',
							fieldtype: 'jira',
							fieldId: 'assignee',
							from: null,
							fromString: 'User A',
							to: null,
							toString: 'User B',
						},
					],
				},
			] as IssueChangeLogEntry[]

			jest.spyOn(changelogProcessing, 'findFieldChangesBefore').mockReturnValue(mockAssigneeChanges)
			jest.spyOn(changelogProcessing, 'extractFieldValueFromChange').mockReturnValue('Previous Assignee')

			// Execute
			const result = getCurrentAssigneeAtTime(mockIssue, '2023-01-02T10:00:00.000Z')

			// Verify
			expect(changelogProcessing.findFieldChangesBefore).toHaveBeenCalledWith(
				mockIssue,
				new Date('2023-01-02T10:00:00.000Z').getTime(),
				'assignee',
			)
			expect(changelogProcessing.extractFieldValueFromChange).toHaveBeenCalledWith(mockAssigneeChanges[0], 'assignee')
			expect(result).toBe('Previous Assignee')
		})

		test('should return current assignee when no assignee changes found in changelog', () => {
			// Setup
			const mockIssue = {
				fields: {
					assignee: { displayName: 'Current Assignee' },
				},
			} as unknown as JiraIssue

			jest.spyOn(changelogProcessing, 'findFieldChangesBefore').mockReturnValue([])

			// Execute
			const result = getCurrentAssigneeAtTime(mockIssue, '2023-01-02T10:00:00.000Z')

			// Verify
			expect(changelogProcessing.findFieldChangesBefore).toHaveBeenCalledWith(
				mockIssue,
				new Date('2023-01-02T10:00:00.000Z').getTime(),
				'assignee',
			)
			expect(changelogProcessing.extractFieldValueFromChange).not.toHaveBeenCalled()
			expect(result).toBe('Current Assignee')
		})

		test('should return null when assignee is missing', () => {
			// Setup - testing line 45 branch
			const mockIssue = {
				fields: {
					// No assignee field
				},
			} as unknown as JiraIssue

			jest.spyOn(changelogProcessing, 'findFieldChangesBefore').mockReturnValue([])

			// Execute
			const result = getCurrentAssigneeAtTime(mockIssue, '2023-01-02T10:00:00.000Z')

			// Verify
			expect(result).toBeNull()
		})
	})
})
