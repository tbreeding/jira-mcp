import { countAssigneeChanges } from '../countAssigneeChanges'
import type { JiraIssue } from '../../../../types/issue.types'

describe('countAssigneeChanges', function () {
	test('should return score 0 when there are no assignee changes', function () {
		const mockIssue = {
			changelog: {
				histories: [],
			},
		} as unknown as JiraIssue

		const result = countAssigneeChanges(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	test('should return score 0 when changelog has no assignee field changes', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [{ field: 'status', from: 'To Do', to: 'In Progress' }],
					},
				],
			},
		} as unknown as JiraIssue

		const result = countAssigneeChanges(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	test('should return score 1 for a single assignee change', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [{ field: 'assignee', from: null, to: 'user1' }],
					},
				],
			},
		} as unknown as JiraIssue

		const result = countAssigneeChanges(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Assignee changes: Issue was reassigned 1 times')
	})

	test('should return score 1 for two assignee changes', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [{ field: 'assignee', from: null, to: 'user1' }],
					},
					{
						items: [{ field: 'assignee', from: 'user1', to: 'user2' }],
					},
				],
			},
		} as unknown as JiraIssue

		const result = countAssigneeChanges(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Assignee changes: Issue was reassigned 2 times')
	})

	test('should return score 2 for more than two assignee changes', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [{ field: 'assignee', from: null, to: 'user1' }],
					},
					{
						items: [{ field: 'assignee', from: 'user1', to: 'user2' }],
					},
					{
						items: [{ field: 'assignee', from: 'user2', to: 'user3' }],
					},
				],
			},
		} as unknown as JiraIssue

		const result = countAssigneeChanges(mockIssue)

		expect(result.score).toBe(2)
		expect(result.factor).toBe('Assignee changes: Issue was reassigned 3 times')
	})

	test('should only count changes to different assignees', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [{ field: 'assignee', from: null, to: 'user1' }],
					},
					{
						items: [
							// This is changing to the same assignee so shouldn't be counted
							{ field: 'assignee', from: 'user1', to: 'user1' },
						],
					},
					{
						items: [{ field: 'assignee', from: 'user1', to: 'user2' }],
					},
				],
			},
		} as unknown as JiraIssue

		const result = countAssigneeChanges(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Assignee changes: Issue was reassigned 2 times')
	})

	test('should handle null assignees correctly', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [{ field: 'assignee', from: null, to: 'user1' }],
					},
					{
						items: [{ field: 'assignee', from: 'user1', to: null }],
					},
					{
						items: [{ field: 'assignee', from: null, to: 'user2' }],
					},
				],
			},
		} as unknown as JiraIssue

		const result = countAssigneeChanges(mockIssue)

		expect(result.score).toBe(2)
		expect(result.factor).toBe('Assignee changes: Issue was reassigned 3 times')
	})

	test('should handle issues with no changelog', function () {
		const mockIssue = {} as unknown as JiraIssue

		const result = countAssigneeChanges(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})
})
