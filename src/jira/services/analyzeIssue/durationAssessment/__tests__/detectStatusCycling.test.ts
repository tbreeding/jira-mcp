import { detectStatusCycling } from '../detectStatusCycling'
import { extractStatusTransitions } from '../extractStatusTransitions'
import type { JiraIssue } from '../../../../types/issue.types'
import type { StatusTransition } from '../types/durationAssessment.types'

// Mock dependencies
jest.mock('../extractStatusTransitions')

describe('detectStatusCycling', () => {
	const mockExtractStatusTransitions = extractStatusTransitions as jest.MockedFunction<typeof extractStatusTransitions>

	beforeEach(() => {
		jest.resetAllMocks()
	})

	it('should return zero counts when issue has no transitions', () => {
		mockExtractStatusTransitions.mockReturnValue([])

		const mockIssue = {} as unknown as JiraIssue

		expect(detectStatusCycling(mockIssue)).toEqual({
			count: {},
			totalRevisits: 0,
		})

		expect(mockExtractStatusTransitions).toHaveBeenCalledWith(mockIssue)
	})

	it('should return zero revisits when no cycling occurs', () => {
		const transitions: StatusTransition[] = [
			{
				fromStatus: null,
				toStatus: 'To Do',
				fromStatusCategory: null,
				toStatusCategory: 'new',
				timestamp: '2023-01-01T10:00:00.000Z',
			},
			{
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				fromStatusCategory: 'new',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-05T14:00:00.000Z',
			},
			{
				fromStatus: 'In Progress',
				toStatus: 'Review',
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-10T09:00:00.000Z',
			},
			{
				fromStatus: 'Review',
				toStatus: 'Done',
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'done',
				timestamp: '2023-01-15T16:00:00.000Z',
			},
		]

		mockExtractStatusTransitions.mockReturnValue(transitions)

		const result = detectStatusCycling({} as unknown as JiraIssue)

		expect(result).toEqual({
			count: {
				'To Do': 0,
				'In Progress': 0,
				Review: 0,
				Done: 0,
			},
			totalRevisits: 0,
		})
	})

	it('should detect cycling when statuses are revisited', () => {
		const transitions: StatusTransition[] = [
			{
				fromStatus: null,
				toStatus: 'To Do',
				fromStatusCategory: null,
				toStatusCategory: 'new',
				timestamp: '2023-01-01T10:00:00.000Z',
			},
			{
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				fromStatusCategory: 'new',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-05T14:00:00.000Z',
			},
			{
				fromStatus: 'In Progress',
				toStatus: 'To Do', // Cycling back to To Do
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'new',
				timestamp: '2023-01-10T09:00:00.000Z',
			},
			{
				fromStatus: 'To Do',
				toStatus: 'In Progress', // Cycling back to In Progress
				fromStatusCategory: 'new',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-15T16:00:00.000Z',
			},
			{
				fromStatus: 'In Progress',
				toStatus: 'To Do', // Cycling back to To Do again
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'new',
				timestamp: '2023-01-17T11:00:00.000Z',
			},
			{
				fromStatus: 'To Do',
				toStatus: 'Done',
				fromStatusCategory: 'new',
				toStatusCategory: 'done',
				timestamp: '2023-01-20T16:00:00.000Z',
			},
		]

		mockExtractStatusTransitions.mockReturnValue(transitions)

		const result = detectStatusCycling({} as unknown as JiraIssue)

		expect(result).toEqual({
			count: {
				'To Do': 2, // Visited 3 times, so 2 revisits
				'In Progress': 1, // Visited 2 times, so 1 revisit
				Done: 0, // Visited 1 time, so 0 revisits
			},
			totalRevisits: 3, // 2 + 1 = 3 total revisits
		})
	})

	it('should handle null status values', () => {
		const transitions: StatusTransition[] = [
			{
				fromStatus: null,
				toStatus: null,
				fromStatusCategory: null,
				toStatusCategory: null,
				timestamp: '2023-01-01T10:00:00.000Z',
			},
			{
				fromStatus: null,
				toStatus: 'To Do',
				fromStatusCategory: null,
				toStatusCategory: 'new',
				timestamp: '2023-01-05T14:00:00.000Z',
			},
			{
				fromStatus: 'To Do',
				toStatus: null,
				fromStatusCategory: 'new',
				toStatusCategory: null,
				timestamp: '2023-01-10T09:00:00.000Z',
			},
			{
				fromStatus: null,
				toStatus: 'To Do', // Revisit to To Do
				fromStatusCategory: null,
				toStatusCategory: 'new',
				timestamp: '2023-01-15T16:00:00.000Z',
			},
		]

		mockExtractStatusTransitions.mockReturnValue(transitions)

		const result = detectStatusCycling({} as unknown as JiraIssue)

		// Should count only non-null statuses
		expect(result).toEqual({
			count: {
				'To Do': 1, // Visited 2 times, so 1 revisit
			},
			totalRevisits: 1,
		})
	})
})
