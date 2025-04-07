import { calculateContextSwitchingScore } from '../contextSwitching'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('contextSwitching', () => {
	describe('calculateContextSwitchingScore', () => {
		test('should return a neutral score of 7 when issue has no changelog', () => {
			const issue = {
				changelog: undefined,
			} as unknown as JiraIssue

			expect(calculateContextSwitchingScore(issue)).toBe(7)
		})

		test('should return a neutral score of 7 when issue has empty changelog histories', () => {
			const issue = {
				changelog: {
					histories: [],
				},
			} as unknown as JiraIssue

			expect(calculateContextSwitchingScore(issue)).toBe(7)
		})

		test('should return a high score (10) when there are no assignee changes', () => {
			const issue = {
				changelog: {
					histories: [
						{
							items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }],
						},
					],
				},
			} as unknown as JiraIssue

			expect(calculateContextSwitchingScore(issue)).toBe(10)
		})

		test('should return a score of 10 when there is one assignee change with penalty 0', () => {
			const issue = {
				changelog: {
					histories: [
						{
							items: [{ field: 'assignee', fromString: 'John', toString: 'Jane' }],
						},
					],
				},
			} as unknown as JiraIssue

			// No penalties with just one assignee change
			expect(calculateContextSwitchingScore(issue)).toBe(10)
		})

		test('should return a score of 9 when there are two assignee changes', () => {
			const issue = {
				changelog: {
					histories: [
						{
							items: [{ field: 'assignee', fromString: null, toString: 'Jane' }],
						},
						{
							items: [{ field: 'assignee', fromString: 'Jane', toString: 'John' }],
						},
					],
				},
			} as unknown as JiraIssue

			// 10 - 1 (frequency penalty) = 9
			expect(calculateContextSwitchingScore(issue)).toBe(9)
		})

		test('should return a score of 8 when there are three assignee changes', () => {
			const issue = {
				changelog: {
					histories: [
						{
							items: [{ field: 'assignee', fromString: null, toString: 'Jane' }],
						},
						{
							items: [{ field: 'assignee', fromString: 'Jane', toString: 'John' }],
						},
						{
							items: [{ field: 'assignee', fromString: 'John', toString: 'Bob' }],
						},
					],
				},
			} as unknown as JiraIssue

			// 10 - 2 (frequency penalty) = 8
			expect(calculateContextSwitchingScore(issue)).toBe(8)
		})

		test('should return a lower score of 5 when there are more than five assignee changes', () => {
			const issue = {
				changelog: {
					histories: [
						{ items: [{ field: 'assignee', fromString: null, toString: 'Jane' }] },
						{ items: [{ field: 'assignee', fromString: 'Jane', toString: 'John' }] },
						{ items: [{ field: 'assignee', fromString: 'John', toString: 'Bob' }] },
						{ items: [{ field: 'assignee', fromString: 'Bob', toString: 'Alice' }] },
						{ items: [{ field: 'assignee', fromString: 'Alice', toString: 'Eve' }] },
						{ items: [{ field: 'assignee', fromString: 'Eve', toString: 'Tom' }] },
					],
				},
			} as unknown as JiraIssue

			// 10 - 5 (frequency penalty) = 5
			expect(calculateContextSwitchingScore(issue)).toBe(5)
		})

		test('should apply back-and-forth penalty when assignee is changed back to previous assignee', () => {
			const issue = {
				changelog: {
					histories: [
						{ items: [{ field: 'assignee', fromString: null, toString: 'Jane' }] },
						{ items: [{ field: 'assignee', fromString: 'Jane', toString: 'John' }] },
						{ items: [{ field: 'assignee', fromString: 'John', toString: 'Jane' }] }, // Back to Jane
					],
				},
			} as unknown as JiraIssue

			// 10 - 2 (frequency penalty) - 2 (back-and-forth penalty) = 6
			expect(calculateContextSwitchingScore(issue)).toBe(6)
		})

		test('should handle when assignee is undefined or null', () => {
			const issue = {
				changelog: {
					histories: [
						{ items: [{ field: 'assignee', fromString: null, toString: null }] },
						{ items: [{ field: 'assignee', fromString: null, toString: undefined }] },
					],
				},
			} as unknown as JiraIssue

			// 10 - 1 (frequency penalty for 2 changes) - 0 (no back-and-forth detected since no valid toString values) = 9
			expect(calculateContextSwitchingScore(issue)).toBe(7)
		})

		test('should handle mixed field changes', () => {
			const issue = {
				changelog: {
					histories: [
						{
							items: [
								{ field: 'status', fromString: 'To Do', toString: 'In Progress' },
								{ field: 'assignee', fromString: null, toString: 'Jane' },
							],
						},
						{
							items: [
								{ field: 'status', fromString: 'In Progress', toString: 'Done' },
								{ field: 'assignee', fromString: 'Jane', toString: 'John' },
							],
						},
					],
				},
			} as unknown as JiraIssue

			// 10 - 1 (frequency penalty for 2 changes) = 9
			expect(calculateContextSwitchingScore(issue)).toBe(9)
		})

		test('should ensure score is capped within range 1-10', () => {
			// Create an issue with many assignee changes to push score below 1
			const manyChangesIssue = {
				changelog: {
					histories: Array(15)
						.fill(0)
						.map(() => ({
							items: [{ field: 'assignee', fromString: 'Someone', toString: 'SomeoneElse' }],
						})),
				},
			} as unknown as JiraIssue

			// With 15 changes, the frequency penalty would be 5
			// If there are back-and-forth changes, additional 2 penalty
			// Score would be 10 - 5 - 2 = 3
			expect(calculateContextSwitchingScore(manyChangesIssue)).toBe(3)
		})
	})
})
