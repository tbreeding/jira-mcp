import { analyzeLinkedIssues } from '../analyzeLinkedIssues'
import type { JiraIssue } from '../../../../types/issue.types'

describe('analyzeLinkedIssues', function () {
	test('should return score 0 when there are no linked issues or subtasks', function () {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const result = analyzeLinkedIssues(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	test('should handle empty arrays of linked issues and subtasks', function () {
		const mockIssue = {
			fields: {
				subtasks: [],
				issuelinks: [],
			},
		} as unknown as JiraIssue

		const result = analyzeLinkedIssues(mockIssue)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	test('should return score 1 for few linked issues', function () {
		const mockIssue = {
			fields: {
				subtasks: [],
				issuelinks: [{ id: '1' }, { id: '2' }],
			},
		} as unknown as JiraIssue

		const result = analyzeLinkedIssues(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Related issues: 0 subtasks and 2 linked issues')
	})

	test('should return score 1 for few subtasks', function () {
		const mockIssue = {
			fields: {
				subtasks: [{ id: '1' }, { id: '2' }],
				issuelinks: [],
			},
		} as unknown as JiraIssue

		const result = analyzeLinkedIssues(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Related issues: 2 subtasks and 0 linked issues')
	})

	test('should return score 1 for a combination with few total issues', function () {
		const mockIssue = {
			fields: {
				subtasks: [{ id: '1' }],
				issuelinks: [{ id: '1' }],
			},
		} as unknown as JiraIssue

		const result = analyzeLinkedIssues(mockIssue)

		expect(result.score).toBe(1)
		expect(result.factor).toBe('Related issues: 1 subtasks and 1 linked issues')
	})

	test('should return score 2 for moderate number of linked issues and subtasks', function () {
		const mockIssue = {
			fields: {
				subtasks: [{ id: '1' }, { id: '2' }],
				issuelinks: [{ id: '1' }, { id: '2' }, { id: '3' }],
			},
		} as unknown as JiraIssue

		const result = analyzeLinkedIssues(mockIssue)

		// 2 subtasks + 3 linked issues = 5 > 4
		expect(result.score).toBe(2)
		expect(result.factor).toBe('Related issues: 2 subtasks and 3 linked issues')
	})

	test('should return score 3 for many linked issues and subtasks', function () {
		const mockIssue = {
			fields: {
				subtasks: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
				issuelinks: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
			},
		} as unknown as JiraIssue

		const result = analyzeLinkedIssues(mockIssue)

		// 5 subtasks + 4 linked issues = 9 > 8
		expect(result.score).toBe(3)
		expect(result.factor).toBe('Related issues: 5 subtasks and 4 linked issues')
	})
})
