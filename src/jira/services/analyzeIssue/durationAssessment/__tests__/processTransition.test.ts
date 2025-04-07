import { createStatusPeriod } from '../createStatusPeriod'
import { processTransition } from '../processTransition'
import type { StatusPeriod, StatusTransition } from '../types/durationAssessment.types'

// Mock dependencies
jest.mock('../createStatusPeriod')

describe('processTransition', () => {
	const mockCreateStatusPeriod = createStatusPeriod as jest.MockedFunction<typeof createStatusPeriod>

	beforeEach(() => {
		jest.resetAllMocks()
	})

	it('should add period and return updated status info when period is valid', () => {
		// Setup
		const periods: StatusPeriod[] = []
		const transition: StatusTransition = {
			fromStatus: 'To Do',
			toStatus: 'In Progress',
			fromStatusCategory: 'new',
			toStatusCategory: 'indeterminate',
			timestamp: '2023-01-05T14:00:00.000Z',
		}

		const mockPeriod: StatusPeriod = {
			status: 'To Do',
			statusCategory: 'new',
			startTime: '2023-01-01T10:00:00.000Z',
			endTime: '2023-01-05T14:00:00.000Z',
		}

		mockCreateStatusPeriod.mockReturnValue(mockPeriod)

		// Execute
		const result = processTransition(periods, 'To Do', 'new', '2023-01-01T10:00:00.000Z', transition)

		// Verify
		expect(mockCreateStatusPeriod).toHaveBeenCalledWith(
			'To Do',
			'new',
			'2023-01-01T10:00:00.000Z',
			'2023-01-05T14:00:00.000Z',
		)

		expect(periods).toHaveLength(1)
		expect(periods[0]).toBe(mockPeriod)

		expect(result).toEqual({
			currentStatus: 'In Progress',
			currentStatusCategory: 'indeterminate',
			startTime: '2023-01-05T14:00:00.000Z',
		})
	})

	it('should not add period when createStatusPeriod returns null', () => {
		// Setup
		const periods: StatusPeriod[] = []
		const transition: StatusTransition = {
			fromStatus: null,
			toStatus: 'In Progress',
			fromStatusCategory: null,
			toStatusCategory: 'indeterminate',
			timestamp: '2023-01-05T14:00:00.000Z',
		}

		mockCreateStatusPeriod.mockReturnValue(null)

		// Execute
		const result = processTransition(periods, null, null, '2023-01-01T10:00:00.000Z', transition)

		// Verify
		expect(mockCreateStatusPeriod).toHaveBeenCalledWith(
			null,
			null,
			'2023-01-01T10:00:00.000Z',
			'2023-01-05T14:00:00.000Z',
		)

		expect(periods).toHaveLength(0)

		expect(result).toEqual({
			currentStatus: 'In Progress',
			currentStatusCategory: 'indeterminate',
			startTime: '2023-01-05T14:00:00.000Z',
		})
	})

	it('should handle null values in transition', () => {
		// Setup
		const periods: StatusPeriod[] = []
		const transition: StatusTransition = {
			fromStatus: 'To Do',
			toStatus: null,
			fromStatusCategory: 'new',
			toStatusCategory: null,
			timestamp: '2023-01-05T14:00:00.000Z',
		}

		mockCreateStatusPeriod.mockReturnValue({
			status: 'To Do',
			statusCategory: 'new',
			startTime: '2023-01-01T10:00:00.000Z',
			endTime: '2023-01-05T14:00:00.000Z',
		})

		// Execute
		const result = processTransition(periods, 'To Do', 'new', '2023-01-01T10:00:00.000Z', transition)

		// Verify
		expect(periods).toHaveLength(1)

		expect(result).toEqual({
			currentStatus: null,
			currentStatusCategory: null,
			startTime: '2023-01-05T14:00:00.000Z',
		})
	})
})
