import { analyzeFieldModifications } from '../analyzeFieldModifications'
import type { JiraIssue } from '../../../../types/issue.types'

describe('analyzeFieldModifications', function () {
	test('should return score 0 when there are no field modifications', function () {
		const mockIssue = {
			changelog: {
				histories: [],
			},
		} as unknown as JiraIssue

		const result = analyzeFieldModifications(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	test('should return score 1 for few field modifications', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [
							{ field: 'summary', from: 'Old summary', to: 'New summary' },
							{ field: 'description', from: 'Old desc', to: 'New desc' },
						],
					},
					{
						items: [{ field: 'status', from: 'To Do', to: 'In Progress' }],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeFieldModifications(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Field modifications: 3 changes across 3 different fields')
	})

	test('should return score 2 for moderate field modifications', function () {
		const mockIssue = {
			changelog: {
				histories: Array(5).fill({
					items: [
						{ field: 'summary', from: 'Old summary', to: 'New summary' },
						{ field: 'description', from: 'Old desc', to: 'New desc' },
					],
				}),
			},
		} as unknown as JiraIssue

		const result = analyzeFieldModifications(mockIssue)

		// 5 histories * 2 items = 10 modifications, but only 2 unique fields
		expect(result.score).toBe(2)
		expect(result.factor).toBe('Field modifications: 10 changes across 2 different fields')
	})

	test('should return score 2 when many different fields are modified', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [
							{ field: 'summary', from: 'Old summary', to: 'New summary' },
							{ field: 'description', from: 'Old desc', to: 'New desc' },
							{ field: 'priority', from: 'Low', to: 'High' },
							{ field: 'assignee', from: 'user1', to: 'user2' },
							{ field: 'status', from: 'To Do', to: 'In Progress' },
						],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeFieldModifications(mockIssue)

		// 5 unique fields > 4
		expect(result.score).toBe(2)
		expect(result.factor).toBe('Field modifications: 5 changes across 5 different fields')
	})

	test('should return score 3 for many field modifications', function () {
		const mockIssue = {
			changelog: {
				histories: Array(8).fill({
					items: [
						{ field: 'summary', from: 'Old summary', to: 'New summary' },
						{ field: 'description', from: 'Old desc', to: 'New desc' },
					],
				}),
			},
		} as unknown as JiraIssue

		const result = analyzeFieldModifications(mockIssue)

		// 8 histories * 2 items = 16 modifications > 15
		expect(result.score).toBe(3)
		expect(result.factor).toBe('Field modifications: 16 changes across 2 different fields')
	})

	test('should return score 3 when many different fields are modified', function () {
		const mockIssue = {
			changelog: {
				histories: [
					{
						items: [
							{ field: 'summary', from: 'Old summary', to: 'New summary' },
							{ field: 'description', from: 'Old desc', to: 'New desc' },
							{ field: 'priority', from: 'Low', to: 'High' },
							{ field: 'assignee', from: 'user1', to: 'user2' },
							{ field: 'status', from: 'To Do', to: 'In Progress' },
							{ field: 'labels', from: 'old', to: 'new' },
							{ field: 'components', from: 'old', to: 'new' },
							{ field: 'fixVersions', from: 'old', to: 'new' },
							{ field: 'reporter', from: 'old', to: 'new' },
						],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeFieldModifications(mockIssue)

		// 9 unique fields > 8
		expect(result.score).toBe(3)
		expect(result.factor).toBe('Field modifications: 9 changes across 9 different fields')
	})

	test('should handle issues with no changelog', function () {
		const mockIssue = {} as unknown as JiraIssue

		const result = analyzeFieldModifications(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})
})
