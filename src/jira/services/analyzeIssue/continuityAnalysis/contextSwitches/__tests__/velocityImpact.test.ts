import { assessVelocityImpact } from '../velocityImpact'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('velocityImpact', () => {
	// Define type matching the function parameter
	type AssigneeChange = {
		date: string
		fromAssignee: string | null
		toAssignee: string | null
		status: string | null
	}

	describe('assessVelocityImpact', () => {
		test('should return minimal impact when there are no assignee changes', () => {
			const mockIssue = {} as JiraIssue
			const assigneeChanges: AssigneeChange[] = []

			const result = assessVelocityImpact(mockIssue, assigneeChanges)

			expect(result).toBe('Minimal - single assignee throughout')
		})

		test('should return minimal impact when there is only one assignee change', () => {
			const mockIssue = {} as JiraIssue
			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-01T10:00:00.000Z',
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
			]

			const result = assessVelocityImpact(mockIssue, assigneeChanges)

			expect(result).toBe('Minimal - single assignee throughout')
		})

		test('should return significant impact when there are late stage switches', () => {
			// Create a mock issue with a month-long lifecycle
			const mockIssue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: '2023-01-31T00:00:00.000Z',
				},
			} as unknown as JiraIssue

			// Create changes where the latest change is after 70% of the lifecycle
			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-05T10:00:00.000Z',
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
				{
					date: '2023-01-25T10:00:00.000Z', // This is after 70% of the lifecycle
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'In Progress',
				},
			]

			const result = assessVelocityImpact(mockIssue, assigneeChanges)

			expect(result).toBe('Significant - late stage assignee changes')
		})

		test('should return high impact when there are multiple back-and-forth changes', () => {
			const mockIssue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: '2023-01-15T00:00:00.000Z',
				},
			} as unknown as JiraIssue

			// Create more than 3 changes with more than 2 unique assignees
			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-02T10:00:00.000Z',
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
				{
					date: '2023-01-04T10:00:00.000Z',
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'To Do',
				},
				{
					date: '2023-01-07T10:00:00.000Z',
					fromAssignee: 'User2',
					toAssignee: 'User3',
					status: 'To Do',
				},
				{
					date: '2023-01-10T10:00:00.000Z',
					fromAssignee: 'User3',
					toAssignee: 'User1',
					status: 'To Do',
				},
			]

			const result = assessVelocityImpact(mockIssue, assigneeChanges)

			expect(result).toBe('High - multiple assignees with frequent changes')
		})

		test('should handle null assignees when counting unique assignees', () => {
			const mockIssue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: '2023-01-15T00:00:00.000Z',
				},
			} as unknown as JiraIssue

			// Include null assignees which should be filtered out when counting uniques
			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-02T10:00:00.000Z',
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
				{
					date: '2023-01-04T10:00:00.000Z',
					fromAssignee: 'User1',
					toAssignee: null,
					status: 'To Do',
				},
				{
					date: '2023-01-07T10:00:00.000Z',
					fromAssignee: null,
					toAssignee: 'User2',
					status: 'To Do',
				},
				{
					date: '2023-01-10T10:00:00.000Z',
					fromAssignee: 'User2',
					toAssignee: 'User3',
					status: 'To Do',
				},
			]

			const result = assessVelocityImpact(mockIssue, assigneeChanges)

			// Should count 3 unique assignees (User1, User2, User3) and 4 changes
			expect(result).toBe('High - multiple assignees with frequent changes')
		})

		test('should return moderate impact for changes during active development', () => {
			const mockIssue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					// No resolutiondate to test that case too
				},
			} as unknown as JiraIssue

			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-02T10:00:00.000Z',
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
				{
					date: '2023-01-05T10:00:00.000Z',
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'In Progress',
				},
			]

			const result = assessVelocityImpact(mockIssue, assigneeChanges)

			expect(result).toBe('Moderate - assignee changes during active development')
		})

		test('should identify developing status as active development', () => {
			const mockIssue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: '2023-01-15T00:00:00.000Z',
				},
			} as unknown as JiraIssue

			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-02T10:00:00.000Z',
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
				{
					date: '2023-01-05T10:00:00.000Z',
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'Developing',
				},
			]

			const result = assessVelocityImpact(mockIssue, assigneeChanges)

			expect(result).toBe('Moderate - assignee changes during active development')
		})

		test('should return low impact when assignee changes are at logical handoff points', () => {
			const mockIssue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: '2023-01-15T00:00:00.000Z',
				},
			} as unknown as JiraIssue

			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-02T10:00:00.000Z',
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
				{
					date: '2023-01-10T10:00:00.000Z',
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'Review',
				},
			]

			const result = assessVelocityImpact(mockIssue, assigneeChanges)

			expect(result).toBe('Low - assignee changes at logical handoff points')
		})
	})
})
