import { extractStatusTransitions } from '../extractStatusTransitions'
import type { JiraIssue } from '../../../../types/issue.types'

describe('extractStatusTransitions', () => {
	// Test for empty issue or missing changelog
	it('should return empty array when issue has no changelog', () => {
		const issueWithoutChangelog = {} as unknown as JiraIssue
		expect(extractStatusTransitions(issueWithoutChangelog)).toEqual([])
	})

	it('should return empty array when changelog has no histories', () => {
		const issueWithEmptyChangelog = {
			changelog: {
				histories: [],
			},
		} as unknown as JiraIssue
		expect(extractStatusTransitions(issueWithEmptyChangelog)).toEqual([])
	})

	it('should return empty array when changelog histories is not an array', () => {
		const issueWithInvalidChangelog = {
			changelog: {
				histories: null,
			},
		} as unknown as JiraIssue
		expect(extractStatusTransitions(issueWithInvalidChangelog)).toEqual([])
	})

	// Test with actual status transitions
	it('should correctly extract status transitions with categories', () => {
		const mockIssue = {
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T10:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: 'To Do',
								toString: 'In Progress',
							},
						],
					},
					{
						id: '2',
						created: '2023-01-03T14:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: 'In Progress',
								toString: 'Review',
							},
						],
					},
					{
						id: '3',
						created: '2023-01-05T09:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: 'Review',
								toString: 'Done',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		const expected = [
			{
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				fromStatusCategory: 'new',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-01T10:00:00.000Z',
			},
			{
				fromStatus: 'In Progress',
				toStatus: 'Review',
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-03T14:00:00.000Z',
			},
			{
				fromStatus: 'Review',
				toStatus: 'Done',
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'done',
				timestamp: '2023-01-05T09:00:00.000Z',
			},
		]

		expect(extractStatusTransitions(mockIssue)).toEqual(expected)
	})

	it('should handle multiple status changes in the same history item', () => {
		const mockIssue = {
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T10:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: 'To Do',
								toString: 'In Progress',
							},
							{
								field: 'priority',
								fromString: 'Medium',
								toString: 'High',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		expect(extractStatusTransitions(mockIssue)).toEqual([
			{
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				fromStatusCategory: 'new',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-01T10:00:00.000Z',
			},
		])
	})

	it('should sort transitions by timestamp if not chronologically ordered', () => {
		const mockIssue = {
			changelog: {
				histories: [
					{
						id: '2',
						created: '2023-01-03T14:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: 'In Progress',
								toString: 'Done',
							},
						],
					},
					{
						id: '1',
						created: '2023-01-01T10:00:00.000Z',
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

		const result = extractStatusTransitions(mockIssue)

		expect(result[0].timestamp).toBe('2023-01-01T10:00:00.000Z')
		expect(result[1].timestamp).toBe('2023-01-03T14:00:00.000Z')
	})

	it('should handle null status values and determine appropriate categories', () => {
		const mockIssue = {
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T10:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: null,
								toString: 'Backlog',
							},
						],
					},
					{
						id: '2',
						created: '2023-01-02T10:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: 'Backlog',
								toString: 'Development',
							},
						],
					},
					{
						id: '3',
						created: '2023-01-03T10:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: 'Development',
								toString: 'Completed',
							},
						],
					},
					{
						id: '4',
						created: '2023-01-04T10:00:00.000Z',
						items: [
							{
								field: 'status',
								fromString: 'Completed',
								toString: 'Some Unknown Status',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractStatusTransitions(mockIssue)

		expect(result).toEqual([
			{
				fromStatus: null,
				toStatus: 'Backlog',
				fromStatusCategory: null,
				toStatusCategory: 'new',
				timestamp: '2023-01-01T10:00:00.000Z',
			},
			{
				fromStatus: 'Backlog',
				toStatus: 'Development',
				fromStatusCategory: 'new',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-02T10:00:00.000Z',
			},
			{
				fromStatus: 'Development',
				toStatus: 'Completed',
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'done',
				timestamp: '2023-01-03T10:00:00.000Z',
			},
			{
				fromStatus: 'Completed',
				toStatus: 'Some Unknown Status',
				fromStatusCategory: 'done',
				toStatusCategory: null,
				timestamp: '2023-01-04T10:00:00.000Z',
			},
		])
	})
})
