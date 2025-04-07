import { calculateInProgressDuration } from '../calculateInProgressDuration'
import { extractStatusTransitions } from '../extractStatusTransitions'
import { calculateBusinessDays } from '../utils/dateUtils'
import type { JiraIssue } from '../../../../types/issue.types'
import type { StatusTransition } from '../types/durationAssessment.types'

// Mock dependencies
jest.mock('../extractStatusTransitions')
jest.mock('../utils/dateUtils')

describe('calculateInProgressDuration', () => {
	const mockExtractStatusTransitions = extractStatusTransitions as jest.MockedFunction<typeof extractStatusTransitions>
	const mockCalculateBusinessDays = calculateBusinessDays as jest.MockedFunction<typeof calculateBusinessDays>

	beforeEach(() => {
		jest.resetAllMocks()
	})

	it('should return null values when issue has no transitions', () => {
		mockExtractStatusTransitions.mockReturnValue([])

		const result = calculateInProgressDuration({} as unknown as JiraIssue)

		expect(result).toEqual({
			inProgressDays: null,
			firstInProgress: null,
			lastDone: null,
		})

		expect(mockCalculateBusinessDays).not.toHaveBeenCalled()
	})

	it('should return null for inProgressDays when no in-progress transition exists', () => {
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
				toStatus: 'Done',
				fromStatusCategory: 'new',
				toStatusCategory: 'done',
				timestamp: '2023-01-10T16:00:00.000Z',
			},
		]

		mockExtractStatusTransitions.mockReturnValue(transitions)

		const result = calculateInProgressDuration({} as unknown as JiraIssue)

		expect(result).toEqual({
			inProgressDays: null,
			firstInProgress: null,
			lastDone: '2023-01-10T16:00:00.000Z',
		})

		// Business days function should not be called when there's no in-progress status
		expect(mockCalculateBusinessDays).not.toHaveBeenCalled()
	})

	it('should return null for inProgressDays when no done transition exists', () => {
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
				timestamp: '2023-01-05T11:00:00.000Z',
			},
		]

		mockExtractStatusTransitions.mockReturnValue(transitions)

		const result = calculateInProgressDuration({} as unknown as JiraIssue)

		expect(result).toEqual({
			inProgressDays: null,
			firstInProgress: '2023-01-05T11:00:00.000Z',
			lastDone: null,
		})

		// Business days function should not be called when there's no done status
		expect(mockCalculateBusinessDays).not.toHaveBeenCalled()
	})

	it('should calculate days between first in progress and last done when both exist', () => {
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
				timestamp: '2023-01-05T11:00:00.000Z',
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
		mockCalculateBusinessDays.mockReturnValue(8) // 8 business days between Jan 5 and Jan 15

		const result = calculateInProgressDuration({} as unknown as JiraIssue)

		expect(result).toEqual({
			inProgressDays: 8,
			firstInProgress: '2023-01-05T11:00:00.000Z',
			lastDone: '2023-01-15T16:00:00.000Z',
		})

		// Business days function should be called with the correct dates
		expect(mockCalculateBusinessDays).toHaveBeenCalledWith('2023-01-05T11:00:00.000Z', '2023-01-15T16:00:00.000Z')
	})

	it('should find the first in-progress and last done transitions when multiple exist', () => {
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
				timestamp: '2023-01-05T11:00:00.000Z',
			},
			{
				fromStatus: 'In Progress',
				toStatus: 'Done',
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'done',
				timestamp: '2023-01-10T09:00:00.000Z',
			},
			{
				fromStatus: 'Done',
				toStatus: 'In Progress', // Re-opened
				fromStatusCategory: 'done',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-12T14:00:00.000Z',
			},
			{
				fromStatus: 'In Progress',
				toStatus: 'Done', // Final done
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'done',
				timestamp: '2023-01-15T16:00:00.000Z',
			},
		]

		mockExtractStatusTransitions.mockReturnValue(transitions)
		mockCalculateBusinessDays.mockReturnValue(8)

		const result = calculateInProgressDuration({} as unknown as JiraIssue)

		// Should find the first in-progress (Jan 5) and last done (Jan 15)
		expect(result).toEqual({
			inProgressDays: 8,
			firstInProgress: '2023-01-05T11:00:00.000Z',
			lastDone: '2023-01-15T16:00:00.000Z',
		})
	})
})
