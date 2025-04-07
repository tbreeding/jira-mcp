import { analyzeContextSwitches } from '../analyzeContextSwitches'
import { extractAssigneeChangesFromChangelog } from '../assigneeChanges'
import { assessVelocityImpact } from '../velocityImpact'
import type { JiraIssue } from '../../../../../types/issue.types'

// Mock dependencies
jest.mock('../assigneeChanges', () => ({
	extractAssigneeChangesFromChangelog: jest.fn(),
}))

jest.mock('../velocityImpact', () => ({
	assessVelocityImpact: jest.fn(),
}))

jest.mock('../../utils/calculateBusinessDays', () => ({
	calculateBusinessDays: jest.fn().mockReturnValue(5),
}))

describe('analyzeContextSwitches', () => {
	// Setup mock issue
	const mockIssue = { fields: { created: '2023-01-01T00:00:00.000Z' } } as unknown as JiraIssue

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should return empty results when there are no assignee changes', () => {
		// Setup
		;(extractAssigneeChangesFromChangelog as jest.Mock).mockReturnValue([])

		// Execute
		const result = analyzeContextSwitches(mockIssue)

		// Verify
		expect(result).toEqual({
			count: 0,
			timing: [],
			impact: 'None - no assignee changes',
		})
		expect(extractAssigneeChangesFromChangelog).toHaveBeenCalledWith(mockIssue)
		expect(assessVelocityImpact).not.toHaveBeenCalled()
	})

	test('should analyze context switches correctly when assignee changes exist', () => {
		// Setup
		const mockChanges = [
			{
				date: '2023-01-05T00:00:00.000Z',
				fromAssignee: 'User1',
				toAssignee: 'User2',
				status: 'In Progress',
			},
			{
				date: '2023-01-10T00:00:00.000Z',
				fromAssignee: 'User2',
				toAssignee: 'User3',
				status: 'In Progress',
			},
		]

		;(extractAssigneeChangesFromChangelog as jest.Mock).mockReturnValue(mockChanges)
		;(assessVelocityImpact as jest.Mock).mockReturnValue('Significant impact')

		// Execute
		const result = analyzeContextSwitches(mockIssue)

		// Verify
		expect(result).toEqual({
			count: 2,
			timing: [
				{
					date: '2023-01-05T00:00:00.000Z',
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'In Progress',
					daysFromStart: 5,
				},
				{
					date: '2023-01-10T00:00:00.000Z',
					fromAssignee: 'User2',
					toAssignee: 'User3',
					status: 'In Progress',
					daysFromStart: 5,
				},
			],
			impact: 'Significant impact',
		})

		expect(extractAssigneeChangesFromChangelog).toHaveBeenCalledWith(mockIssue)
		expect(assessVelocityImpact).toHaveBeenCalledWith(mockIssue, mockChanges)
	})

	test('should handle assignee changes with missing status', () => {
		// Setup
		const mockChanges = [
			{
				date: '2023-01-05T00:00:00.000Z',
				fromAssignee: 'User1',
				toAssignee: 'User2',
				status: null,
			},
		]

		;(extractAssigneeChangesFromChangelog as jest.Mock).mockReturnValue(mockChanges)
		;(assessVelocityImpact as jest.Mock).mockReturnValue('Minimal impact')

		// Execute
		const result = analyzeContextSwitches(mockIssue)

		// Verify
		expect(result).toEqual({
			count: 1,
			timing: [
				{
					date: '2023-01-05T00:00:00.000Z',
					fromAssignee: 'User1',
					toAssignee: 'User2',
					status: 'Unknown',
					daysFromStart: 5,
				},
			],
			impact: 'Minimal impact',
		})

		expect(extractAssigneeChangesFromChangelog).toHaveBeenCalledWith(mockIssue)
		expect(assessVelocityImpact).toHaveBeenCalledWith(mockIssue, mockChanges)
	})
})
