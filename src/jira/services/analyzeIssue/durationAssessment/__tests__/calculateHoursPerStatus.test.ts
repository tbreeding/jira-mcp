import { calculateHoursPerStatus } from '../calculateHoursPerStatus'
import { calculateHoursBetween } from '../utils/dateUtils'
import type { StatusPeriod } from '../types/durationAssessment.types'

// Mock dependencies
jest.mock('../utils/dateUtils')

describe('calculateHoursPerStatus', () => {
	const mockCalculateHoursBetween = calculateHoursBetween as jest.MockedFunction<typeof calculateHoursBetween>
	const mockDate = new Date('2023-01-20T12:00:00.000Z')

	beforeEach(() => {
		jest.resetAllMocks()

		// Set a fixed system time for testing
		jest.useFakeTimers()
		jest.setSystemTime(mockDate)
	})

	afterEach(() => {
		jest.useRealTimers()
		jest.restoreAllMocks()
	})

	it('should return empty object when statusPeriods is empty', () => {
		const result = calculateHoursPerStatus([])
		expect(result).toEqual({})
		expect(mockCalculateHoursBetween).not.toHaveBeenCalled()
	})

	it('should calculate hours for a single status with endTime', () => {
		// Setup
		const periods: StatusPeriod[] = [
			{
				status: 'To Do',
				statusCategory: 'new',
				startTime: '2023-01-01T10:00:00.000Z',
				endTime: '2023-01-05T14:00:00.000Z',
			},
		]

		mockCalculateHoursBetween.mockReturnValue(100)

		// Execute
		const result = calculateHoursPerStatus(periods)

		// Verify
		expect(mockCalculateHoursBetween).toHaveBeenCalledWith('2023-01-01T10:00:00.000Z', '2023-01-05T14:00:00.000Z')

		expect(result).toEqual({
			'To Do': 100,
		})
	})

	it('should calculate hours for a single status with null endTime (using current date)', () => {
		// Setup
		const periods: StatusPeriod[] = [
			{
				status: 'In Progress',
				statusCategory: 'indeterminate',
				startTime: '2023-01-10T09:00:00.000Z',
				endTime: null,
			},
		]

		mockCalculateHoursBetween.mockReturnValue(250)

		// Execute
		const result = calculateHoursPerStatus(periods)

		// Verify
		expect(mockCalculateHoursBetween).toHaveBeenCalledWith('2023-01-10T09:00:00.000Z', mockDate.toISOString())

		expect(result).toEqual({
			'In Progress': 250,
		})
	})

	it('should calculate and aggregate hours for multiple periods with same status', () => {
		// Setup
		const periods: StatusPeriod[] = [
			{
				status: 'To Do',
				statusCategory: 'new',
				startTime: '2023-01-01T10:00:00.000Z',
				endTime: '2023-01-05T14:00:00.000Z',
			},
			{
				status: 'In Progress',
				statusCategory: 'indeterminate',
				startTime: '2023-01-05T14:00:00.000Z',
				endTime: '2023-01-10T09:00:00.000Z',
			},
			{
				status: 'To Do', // Same status again
				statusCategory: 'new',
				startTime: '2023-01-10T09:00:00.000Z',
				endTime: '2023-01-15T16:00:00.000Z',
			},
			{
				status: 'Done',
				statusCategory: 'done',
				startTime: '2023-01-15T16:00:00.000Z',
				endTime: null,
			},
		]

		// Mock hours for each period
		mockCalculateHoursBetween
			.mockReturnValueOnce(100) // To Do (first time): 100 hours
			.mockReturnValueOnce(115) // In Progress: 115 hours
			.mockReturnValueOnce(127) // To Do (second time): 127 hours
			.mockReturnValueOnce(116) // Done: 116 hours

		// Execute
		const result = calculateHoursPerStatus(periods)

		// Verify
		expect(mockCalculateHoursBetween).toHaveBeenCalledTimes(4)

		// Verify aggregation of To Do status
		expect(result).toEqual({
			'To Do': 227, // 100 + 127
			'In Progress': 115,
			Done: 116,
		})
	})
})
