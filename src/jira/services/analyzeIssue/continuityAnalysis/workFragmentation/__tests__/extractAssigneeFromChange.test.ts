import { extractAssigneeFromChange } from '../extractAssigneeFromChange'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('extractAssigneeFromChange', () => {
	test('should extract assignee from changelog history entry', () => {
		// Create mock history entry with assignee change
		const historyEntry = {
			id: '123',
			created: '2023-01-02T10:00:00.000Z',
			items: [
				{
					field: 'assignee',
					fromString: 'User A',
					toString: 'User B',
				},
			],
		} as unknown as JiraIssue['changelog']['histories'][0]

		// Call function
		const result = extractAssigneeFromChange(historyEntry)

		// Verify
		expect(result).toBe('User B')
	})

	test('should return null when no assignee item is found', () => {
		// Create mock history entry with no assignee change
		const historyEntry = {
			id: '123',
			created: '2023-01-02T10:00:00.000Z',
			items: [
				{
					field: 'status',
					fromString: 'To Do',
					toString: 'In Progress',
				},
			],
		} as unknown as JiraIssue['changelog']['histories'][0]

		// Call function
		const result = extractAssigneeFromChange(historyEntry)

		// Verify
		expect(result).toBeNull()
	})

	test('should handle multiple items and find assignee change', () => {
		// Create mock history entry with multiple changes including assignee
		const historyEntry = {
			id: '123',
			created: '2023-01-02T10:00:00.000Z',
			items: [
				{
					field: 'status',
					fromString: 'To Do',
					toString: 'In Progress',
				},
				{
					field: 'assignee',
					fromString: 'User A',
					toString: 'User B',
				},
				{
					field: 'priority',
					fromString: 'Medium',
					toString: 'High',
				},
			],
		} as unknown as JiraIssue['changelog']['histories'][0]

		// Call function
		const result = extractAssigneeFromChange(historyEntry)

		// Verify
		expect(result).toBe('User B')
	})
})
