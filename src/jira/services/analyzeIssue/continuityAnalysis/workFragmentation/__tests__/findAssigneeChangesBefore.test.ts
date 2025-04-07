import { findAssigneeChangesBefore } from '../findAssigneeChangesBefore'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('findAssigneeChangesBefore', () => {
	test('should handle null changelog', () => {
		// Create mock issue with null changelog
		const issue = {
			fields: {},
			// No changelog
		} as unknown as JiraIssue

		// Call function
		const result = findAssigneeChangesBefore(issue, Date.now())

		// Verify
		expect(result).toEqual([])
	})

	test('should handle empty histories array', () => {
		// Create mock issue with empty histories array
		const issue = {
			fields: {},
			changelog: {
				histories: [],
			},
		} as unknown as JiraIssue

		// Call function
		const result = findAssigneeChangesBefore(issue, Date.now())

		// Verify
		expect(result).toEqual([])
	})

	test('should handle non-array histories', () => {
		// Create mock issue with non-array histories
		const issue = {
			fields: {},
			changelog: {
				histories: null,
			},
		} as unknown as JiraIssue

		// Call function
		const result = findAssigneeChangesBefore(issue, Date.now())

		// Verify
		expect(result).toEqual([])
	})

	test('should filter out histories without items', () => {
		// Create mock issue with history without items
		const issue = {
			fields: {},
			changelog: {
				histories: [
					{
						id: '123',
						created: '2023-01-02T10:00:00.000Z',
						// No items
					},
				],
			},
		} as unknown as JiraIssue

		// Call function
		const result = findAssigneeChangesBefore(issue, Date.now())

		// Verify
		expect(result).toEqual([])
	})

	test('should filter out histories without created date', () => {
		// Create mock issue with history without created date
		const issue = {
			fields: {},
			changelog: {
				histories: [
					{
						id: '123',
						// No created date
						items: [
							{
								field: 'assignee',
								fromString: 'User A',
								toString: 'User B',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		// Call function
		const result = findAssigneeChangesBefore(issue, Date.now())

		// Verify
		expect(result).toEqual([])
	})

	test('should filter out non-assignee changes', () => {
		// Create mock issue with non-assignee changes
		const issue = {
			fields: {},
			changelog: {
				histories: [
					{
						id: '123',
						created: '2023-01-02T10:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: 'To Do',
								toString: 'In Progress',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		// Call function
		const result = findAssigneeChangesBefore(issue, Date.now())

		// Verify
		expect(result).toEqual([])
	})

	test('should filter changes after target time', () => {
		// Set target time to January 3rd, 2023
		const targetTime = new Date('2023-01-03T10:00:00.000Z').getTime()

		// Create mock issue with changes before and after target time
		const issue = {
			fields: {},
			changelog: {
				histories: [
					{
						id: '123',
						created: '2023-01-02T10:00:00.000Z', // Before target
						items: [
							{
								field: 'assignee',
								fromString: 'User A',
								toString: 'User B',
							},
						],
					},
					{
						id: '124',
						created: '2023-01-04T10:00:00.000Z', // After target
						items: [
							{
								field: 'assignee',
								fromString: 'User B',
								toString: 'User C',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		// Call function
		const result = findAssigneeChangesBefore(issue, targetTime)

		// Verify - should only include changes before target time
		expect(result).toHaveLength(1)
		expect(result[0].id).toBe('123')
	})

	test('should include changes exactly at target time', () => {
		// Set target time to January 3rd, 2023
		const targetTime = new Date('2023-01-03T10:00:00.000Z').getTime()

		// Create mock issue with a change exactly at target time
		const issue = {
			fields: {},
			changelog: {
				histories: [
					{
						id: '123',
						created: '2023-01-03T10:00:00.000Z', // Exactly at target
						items: [
							{
								field: 'assignee',
								fromString: 'User A',
								toString: 'User B',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		// Call function
		const result = findAssigneeChangesBefore(issue, targetTime)

		// Verify - should include the change at target time
		expect(result).toHaveLength(1)
		expect(result[0].id).toBe('123')
	})

	test('should sort changes by date (most recent first)', () => {
		// Create mock issue with multiple changes
		const issue = {
			fields: {},
			changelog: {
				histories: [
					{
						id: '123',
						created: '2023-01-01T10:00:00.000Z', // Oldest
						items: [
							{
								field: 'assignee',
								fromString: 'User A',
								toString: 'User B',
							},
						],
					},
					{
						id: '124',
						created: '2023-01-03T10:00:00.000Z', // Most recent
						items: [
							{
								field: 'assignee',
								fromString: 'User B',
								toString: 'User C',
							},
						],
					},
					{
						id: '125',
						created: '2023-01-02T10:00:00.000Z', // Middle
						items: [
							{
								field: 'assignee',
								fromString: 'User B',
								toString: 'User D',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		// Call function
		const result = findAssigneeChangesBefore(issue, Date.now())

		// Verify - should be sorted with most recent first
		expect(result).toHaveLength(3)
		expect(result[0].id).toBe('124') // Most recent
		expect(result[1].id).toBe('125') // Middle
		expect(result[2].id).toBe('123') // Oldest
	})
})
