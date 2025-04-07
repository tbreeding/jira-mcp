import { createActivePeriod } from '../activePeriods/createActivePeriod'
import { createWorkPeriodFromDates } from '../activePeriods/createWorkPeriodFromDates'
import { isActiveStatus } from '../isActiveStatus'
import { calculateIssueDates } from '../issueDates/calculateIssueDates'
import { calculateTotalActiveHours } from '../statistics/calculateTotalActiveHours'
import { isInitialStatusActive } from '../status/isInitialStatusActive'

// Mock isActiveStatus
jest.mock('../isActiveStatus')

describe('workPeriodUtils', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		// Reset timers between tests
		jest.useRealTimers()
	})

	describe('calculateIssueDates', () => {
		test('should calculate start and end dates for resolved issue', () => {
			const mockIssue = {
				fields: {
					created: '2023-01-01T10:00:00.000Z',
					resolutiondate: '2023-01-15T10:00:00.000Z',
				},
			} as any

			const result = calculateIssueDates(mockIssue)

			expect(result.startDate).toEqual(new Date('2023-01-01T10:00:00.000Z'))
			expect(result.endDate).toEqual(new Date('2023-01-15T10:00:00.000Z'))
		})

		test('should use current date for unresolved issue', () => {
			const mockIssue = {
				fields: {
					created: '2023-01-01T10:00:00.000Z',
					resolutiondate: null,
				},
			} as any

			// Use fake timers to set current date
			const mockDate = new Date('2023-01-10T10:00:00.000Z')
			jest.useFakeTimers()
			jest.setSystemTime(mockDate)

			try {
				const result = calculateIssueDates(mockIssue)

				expect(result.startDate).toEqual(new Date('2023-01-01T10:00:00.000Z'))
				expect(result.endDate).toEqual(mockDate)
			} finally {
				// Restore real timers
				jest.useRealTimers()
			}
		})
	})

	describe('createWorkPeriodFromDates', () => {
		test('should create a work period with correct values', () => {
			const startDate = new Date('2023-01-01T10:00:00.000Z')
			const endDate = new Date('2023-01-02T10:00:00.000Z')
			const status = 'In Progress'
			const assignee = 'user123'

			const result = createWorkPeriodFromDates(startDate, endDate, status, assignee)

			expect(result).toEqual({
				startDate: '2023-01-01T10:00:00.000Z',
				endDate: '2023-01-02T10:00:00.000Z',
				durationHours: 24, // 24 hours difference
				status: 'In Progress',
				assignee: 'user123',
			})
		})

		test('should handle null assignee', () => {
			const startDate = new Date('2023-01-01T10:00:00.000Z')
			const endDate = new Date('2023-01-01T14:00:00.000Z')
			const status = 'In Progress'
			const assignee = null

			const result = createWorkPeriodFromDates(startDate, endDate, status, assignee)

			expect(result).toEqual({
				startDate: '2023-01-01T10:00:00.000Z',
				endDate: '2023-01-01T14:00:00.000Z',
				durationHours: 4, // 4 hours difference
				status: 'In Progress',
				assignee: null,
			})
		})
	})

	describe('createActivePeriod', () => {
		test('should create an active period when duration is >= 1 hour', () => {
			const startDate = new Date('2023-01-01T10:00:00.000Z')
			const endDate = new Date('2023-01-01T12:00:00.000Z')
			const status = 'In Progress'
			const assignee = 'user123'

			const result = createActivePeriod(startDate, endDate, status, assignee)

			expect(result).toEqual({
				startDate: '2023-01-01T10:00:00.000Z',
				endDate: '2023-01-01T12:00:00.000Z',
				durationHours: 2, // 2 hours difference
				status: 'In Progress',
				assignee: 'user123',
			})
		})

		test('should return null when duration is < 1 hour', () => {
			const startDate = new Date('2023-01-01T10:00:00.000Z')
			const endDate = new Date('2023-01-01T10:30:00.000Z')
			const status = 'In Progress'
			const assignee = 'user123'

			const result = createActivePeriod(startDate, endDate, status, assignee)

			expect(result).toBeNull()
		})

		test('should use "Unknown" for empty status', () => {
			const startDate = new Date('2023-01-01T10:00:00.000Z')
			const endDate = new Date('2023-01-01T12:00:00.000Z')
			const status = ''
			const assignee = 'user123'

			const result = createActivePeriod(startDate, endDate, status, assignee)

			expect(result).toEqual({
				startDate: '2023-01-01T10:00:00.000Z',
				endDate: '2023-01-01T12:00:00.000Z',
				durationHours: 2,
				status: 'Unknown',
				assignee: 'user123',
			})
		})
	})

	describe('isInitialStatusActive', () => {
		test('should return true for active status', () => {
			;(isActiveStatus as jest.Mock).mockReturnValue(true)

			const result = isInitialStatusActive('In Progress')

			expect(result).toBe(true)
			expect(isActiveStatus).toHaveBeenCalledWith('In Progress')
		})

		test('should return false for inactive status', () => {
			;(isActiveStatus as jest.Mock).mockReturnValue(false)

			const result = isInitialStatusActive('To Do')

			expect(result).toBe(false)
			expect(isActiveStatus).toHaveBeenCalledWith('To Do')
		})

		test('should return false for null status', () => {
			const result = isInitialStatusActive(null)

			expect(result).toBe(false)
			expect(isActiveStatus).not.toHaveBeenCalled()
		})
	})

	describe('calculateTotalActiveHours', () => {
		test('should sum up all active hours correctly', () => {
			const periods = [
				{
					startDate: '2023-01-01T10:00:00.000Z',
					endDate: '2023-01-01T12:00:00.000Z',
					durationHours: 2,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-02T10:00:00.000Z',
					endDate: '2023-01-02T15:00:00.000Z',
					durationHours: 5,
					status: 'In Progress',
					assignee: 'user1',
				},
				{
					startDate: '2023-01-03T10:00:00.000Z',
					endDate: '2023-01-03T14:00:00.000Z',
					durationHours: 4,
					status: 'In Progress',
					assignee: 'user2',
				},
			]

			const result = calculateTotalActiveHours(periods)

			expect(result).toBe(11) // 2 + 5 + 4 = 11
		})

		test('should return 0 for empty array', () => {
			const result = calculateTotalActiveHours([])

			expect(result).toBe(0)
		})
	})
})
