import { identifyLateStageSwitches } from '../lateStageSwitches'
import type { JiraIssue } from '../../../../../types/issue.types'
import type { AssigneeChange } from '../types/contextSwitches.types'

describe('lateStageSwitches', () => {
	describe('identifyLateStageSwitches', () => {
		test('should identify late stage switches correctly', () => {
			// Create a mock issue with a month-long lifecycle
			const mockIssue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: '2023-01-31T00:00:00.000Z',
				},
			} as unknown as JiraIssue

			// Create changes with one early and one late change
			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-05T10:00:00.000Z', // Early change (around 16% into the lifecycle)
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
				{
					date: '2023-01-25T10:00:00.000Z', // Late change (around 80% into the lifecycle)
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'In Progress',
				},
			]

			const result = identifyLateStageSwitches(mockIssue, assigneeChanges)

			// Should only include the late change
			expect(result.length).toBe(1)
			expect(result[0].date).toBe('2023-01-25T10:00:00.000Z')
			expect(result[0].toAssignee).toBe('User2')
		})

		test('should handle unresolved issues', () => {
			// Use fake timers and set the system time
			jest.useFakeTimers()
			jest.setSystemTime(new Date('2023-01-31T00:00:00.000Z'))

			// Create a mock unresolved issue
			const mockIssue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: null,
				},
			} as unknown as JiraIssue

			// Create changes
			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-05T10:00:00.000Z', // Early change
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
				{
					date: '2023-01-25T10:00:00.000Z', // Late change (around 80% into the lifecycle using the mock current date)
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'In Progress',
				},
			]

			const result = identifyLateStageSwitches(mockIssue, assigneeChanges)

			// Should only include the late change
			expect(result.length).toBe(1)
			expect(result[0].date).toBe('2023-01-25T10:00:00.000Z')

			// Restore real timers
			jest.useRealTimers()
		})

		test('should return empty array when no late changes exist', () => {
			// Create a mock issue
			const mockIssue = {
				fields: {
					created: '2023-01-01T00:00:00.000Z',
					resolutiondate: '2023-01-31T00:00:00.000Z',
				},
			} as unknown as JiraIssue

			// Create early changes only
			const assigneeChanges: AssigneeChange[] = [
				{
					date: '2023-01-05T10:00:00.000Z', // Early change
					fromAssignee: null,
					toAssignee: 'User1',
					status: 'To Do',
				},
				{
					date: '2023-01-10T10:00:00.000Z', // Another early change
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'In Progress',
				},
			]

			const result = identifyLateStageSwitches(mockIssue, assigneeChanges)

			expect(result.length).toBe(0)
		})
	})
})
