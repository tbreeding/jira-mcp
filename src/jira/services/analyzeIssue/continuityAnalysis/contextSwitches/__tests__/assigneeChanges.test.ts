import { extractAssigneeChangesFromChangelog } from '../assigneeChanges'
import { getCurrentStatus } from '../statusTracking'
import type { JiraIssue } from '../../../../../types/issue.types'

// Mock dependencies
jest.mock('../statusTracking', () => ({
	getCurrentStatus: jest.fn(),
}))

describe('assigneeChanges', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('extractAssigneeChangesFromChangelog', () => {
		test('should extract assignee changes from issue changelog', () => {
			// Mock getCurrentStatus implementation
			;(getCurrentStatus as jest.Mock).mockImplementation((issue, timestamp) => {
				if (timestamp === '2023-01-05T10:00:00.000Z') return 'In Progress'
				if (timestamp === '2023-01-10T15:00:00.000Z') return 'Review'
				return 'To Do'
			})

			// Create mock issue with assignee changes
			const mockIssue = {
				changelog: {
					histories: [
						{
							id: '1',
							created: '2023-01-05T10:00:00.000Z',
							items: [
								{
									field: 'assignee',
									fromString: 'User1',
									toString: 'User2',
								},
							],
						},
						{
							id: '2',
							created: '2023-01-10T15:00:00.000Z',
							items: [
								{
									field: 'assignee',
									fromString: 'User2',
									toString: 'User3',
								},
							],
						},
						{
							id: '3',
							created: '2023-01-15T09:00:00.000Z',
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

			const result = extractAssigneeChangesFromChangelog(mockIssue)

			expect(result).toHaveLength(2)

			expect(result[0]).toEqual({
				date: '2023-01-05T10:00:00.000Z',
				fromAssignee: 'User1',
				toAssignee: 'User2',
				status: 'In Progress',
			})

			expect(result[1]).toEqual({
				date: '2023-01-10T15:00:00.000Z',
				fromAssignee: 'User2',
				toAssignee: 'User3',
				status: 'Review',
			})

			expect(getCurrentStatus).toHaveBeenCalledTimes(2)
		})

		test('should handle missing fromString or toString in assignee changes', () => {
			// Mock getCurrentStatus implementation
			;(getCurrentStatus as jest.Mock).mockReturnValue('In Progress')

			// Create mock issue with assignee changes with missing values
			const mockIssue = {
				changelog: {
					histories: [
						{
							id: '1',
							created: '2023-01-05T10:00:00.000Z',
							items: [
								{
									field: 'assignee',
									fromString: null,
									toString: 'User1',
								},
							],
						},
						{
							id: '2',
							created: '2023-01-10T15:00:00.000Z',
							items: [
								{
									field: 'assignee',
									fromString: 'User1',
									toString: null,
								},
							],
						},
					],
				},
			} as unknown as JiraIssue

			const result = extractAssigneeChangesFromChangelog(mockIssue)

			expect(result).toHaveLength(2)

			expect(result[0]).toEqual({
				date: '2023-01-05T10:00:00.000Z',
				fromAssignee: null,
				toAssignee: 'User1',
				status: 'In Progress',
			})

			expect(result[1]).toEqual({
				date: '2023-01-10T15:00:00.000Z',
				fromAssignee: 'User1',
				toAssignee: null,
				status: 'In Progress',
			})
		})

		test('should return empty array when issue has no changelog', () => {
			const mockIssue = {} as unknown as JiraIssue

			const result = extractAssigneeChangesFromChangelog(mockIssue)

			expect(result).toEqual([])
			expect(getCurrentStatus).not.toHaveBeenCalled()
		})

		test('should return empty array when issue has empty histories', () => {
			const mockIssue = {
				changelog: {
					histories: [],
				},
			} as unknown as JiraIssue

			const result = extractAssigneeChangesFromChangelog(mockIssue)

			expect(result).toEqual([])
			expect(getCurrentStatus).not.toHaveBeenCalled()
		})

		test('should handle histories without assignee changes', () => {
			const mockIssue = {
				changelog: {
					histories: [
						{
							id: '1',
							created: '2023-01-05T10:00:00.000Z',
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

			const result = extractAssigneeChangesFromChangelog(mockIssue)

			expect(result).toEqual([])
			expect(getCurrentStatus).not.toHaveBeenCalled()
		})
	})
})
