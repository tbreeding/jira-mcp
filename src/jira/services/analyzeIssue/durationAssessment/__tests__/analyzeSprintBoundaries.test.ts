import { analyzeSprintBoundaries } from '../analyzeSprintBoundaries'
import type { JiraIssue } from '../../../../types/issue.types'

describe('analyzeSprintBoundaries', () => {
	it('should return no sprint reassignments when issue has no changelog', () => {
		const mockIssue = {} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: false,
			sprintReassignments: 0,
		})
	})

	it('should return no sprint reassignments when changelog has no histories', () => {
		const mockIssue = {
			changelog: {
				histories: [],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: false,
			sprintReassignments: 0,
		})
	})

	it('should return no sprint reassignments when there are no sprint changes', () => {
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
				],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: false,
			sprintReassignments: 0,
		})
	})

	it('should detect a sprint change and count as exceeding sprint', () => {
		const mockIssue = {
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T10:00:00.000Z',
						items: [
							{
								field: 'Sprint',
								fromString: 'Sprint 1',
								toString: 'Sprint 2',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: true,
			sprintReassignments: 1,
		})
	})

	it('should count multiple sprint changes correctly', () => {
		const mockIssue = {
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T10:00:00.000Z',
						items: [
							{
								field: 'Sprint',
								fromString: 'Sprint 1',
								toString: 'Sprint 2',
							},
						],
					},
					{
						id: '2',
						created: '2023-01-15T10:00:00.000Z',
						items: [
							{
								field: 'Sprint',
								fromString: 'Sprint 2',
								toString: 'Sprint 3',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: true,
			sprintReassignments: 2,
		})
	})

	it('should handle multiple sprint changes in a single history item', () => {
		const mockIssue = {
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T10:00:00.000Z',
						items: [
							{
								field: 'Sprint',
								fromString: 'Sprint 1',
								toString: 'Sprint 2',
							},
							{
								field: 'Sprint',
								fromString: 'Sprint 2',
								toString: 'Sprint 3',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: true,
			sprintReassignments: 2,
		})
	})

	it('should handle comma-separated sprint names in fromString and toString', () => {
		const mockIssue = {
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T10:00:00.000Z',
						items: [
							{
								field: 'Sprint',
								fromString: 'Sprint 1,Sprint 2',
								toString: 'Sprint 3,Sprint 4',
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: true,
			sprintReassignments: 1,
		})
	})

	it('should handle null sprint values', () => {
		const mockIssue = {
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T10:00:00.000Z',
						items: [
							{
								field: 'Sprint',
								fromString: null,
								toString: 'Sprint 1',
							},
						],
					},
					{
						id: '2',
						created: '2023-01-15T10:00:00.000Z',
						items: [
							{
								field: 'Sprint',
								fromString: 'Sprint 1',
								toString: null,
							},
						],
					},
				],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: true,
			sprintReassignments: 2,
		})
	})

	it('should detect multiple sprints in issue fields if no changelog history', () => {
		const mockIssue = {
			changelog: {
				histories: [],
			},
			fields: {
				customfield_10600: [{ name: 'Sprint 1' }, { name: 'Sprint 2' }],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: true,
			sprintReassignments: 0,
		})
	})

	it('should not detect exceeding sprint when single sprint in fields and no changes', () => {
		const mockIssue = {
			changelog: {
				histories: [],
			},
			fields: {
				customfield_10600: [{ name: 'Sprint 1' }],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: false,
			sprintReassignments: 0,
		})
	})

	it('should handle edge case of empty sprint field', () => {
		const mockIssue = {
			changelog: {
				histories: [],
			},
			fields: {
				customfield_10600: [],
			},
		} as unknown as JiraIssue

		const result = analyzeSprintBoundaries(mockIssue)

		expect(result).toEqual({
			exceedsSprint: false,
			sprintReassignments: 0,
		})
	})
})
