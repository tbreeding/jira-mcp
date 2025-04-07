import { convertTransitionsToPeriods } from '../convertTransitionsToPeriods'
import { createStatusPeriod } from '../createStatusPeriod'
import { processTransition } from '../processTransition'
import type { StatusPeriod, StatusTransition } from '../types/durationAssessment.types'

// Mock dependencies
jest.mock('../processTransition')
jest.mock('../createStatusPeriod')

describe('convertTransitionsToPeriods', () => {
	const mockProcessTransition = processTransition as jest.MockedFunction<typeof processTransition>
	const mockCreateStatusPeriod = createStatusPeriod as jest.MockedFunction<typeof createStatusPeriod>

	beforeEach(() => {
		jest.resetAllMocks()
	})

	it('should return empty array when transitions is empty', () => {
		const result = convertTransitionsToPeriods([])
		expect(result).toEqual([])
		expect(mockProcessTransition).not.toHaveBeenCalled()
		expect(mockCreateStatusPeriod).not.toHaveBeenCalled()
	})

	it('should process a single transition into a period', () => {
		// Setup
		const transitions: StatusTransition[] = [
			{
				fromStatus: null,
				toStatus: 'To Do',
				fromStatusCategory: null,
				toStatusCategory: 'new',
				timestamp: '2023-01-01T10:00:00.000Z',
			},
		]

		const mockPeriod: StatusPeriod = {
			status: 'To Do',
			statusCategory: 'new',
			startTime: '2023-01-01T10:00:00.000Z',
			endTime: null,
		}

		mockCreateStatusPeriod.mockReturnValue(mockPeriod)

		// Execute
		const result = convertTransitionsToPeriods(transitions)

		// Verify
		expect(mockProcessTransition).not.toHaveBeenCalled()
		expect(mockCreateStatusPeriod).toHaveBeenCalledWith('To Do', 'new', '2023-01-01T10:00:00.000Z', null)

		expect(result).toEqual([mockPeriod])
	})

	it('should process multiple transitions into periods', () => {
		// Setup
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
				toStatus: 'Done',
				fromStatusCategory: 'indeterminate',
				toStatusCategory: 'done',
				timestamp: '2023-01-10T09:00:00.000Z',
			},
		]

		const mockFinalPeriod: StatusPeriod = {
			status: 'Done',
			statusCategory: 'done',
			startTime: '2023-01-10T09:00:00.000Z',
			endTime: null,
		}

		mockProcessTransition
			.mockReturnValueOnce({
				currentStatus: 'In Progress',
				currentStatusCategory: 'indeterminate',
				startTime: '2023-01-05T14:00:00.000Z',
			})
			.mockReturnValueOnce({
				currentStatus: 'Done',
				currentStatusCategory: 'done',
				startTime: '2023-01-10T09:00:00.000Z',
			})

		mockCreateStatusPeriod.mockReturnValue(mockFinalPeriod)

		// Execute
		const result = convertTransitionsToPeriods(transitions)

		// Verify
		expect(mockProcessTransition).toHaveBeenCalledTimes(2)

		// First call to processTransition
		expect(mockProcessTransition).toHaveBeenNthCalledWith(
			1,
			expect.any(Array),
			'To Do',
			'new',
			'2023-01-01T10:00:00.000Z',
			transitions[1],
		)

		// Second call to processTransition
		expect(mockProcessTransition).toHaveBeenNthCalledWith(
			2,
			expect.any(Array),
			'In Progress',
			'indeterminate',
			'2023-01-05T14:00:00.000Z',
			transitions[2],
		)

		expect(mockCreateStatusPeriod).toHaveBeenCalledWith('Done', 'done', '2023-01-10T09:00:00.000Z', null)

		expect(result).toContain(mockFinalPeriod)
	})

	it('should handle case when final period is null', () => {
		// Setup
		const transitions: StatusTransition[] = [
			{
				fromStatus: null,
				toStatus: 'To Do',
				fromStatusCategory: null,
				toStatusCategory: 'new',
				timestamp: '2023-01-01T10:00:00.000Z',
			},
		]

		// Final period is null (e.g., current status is null)
		mockCreateStatusPeriod.mockReturnValue(null)

		// Execute
		const result = convertTransitionsToPeriods(transitions)

		// Verify
		expect(result).toEqual([])
		expect(mockCreateStatusPeriod).toHaveBeenCalledWith('To Do', 'new', '2023-01-01T10:00:00.000Z', null)
	})
})
