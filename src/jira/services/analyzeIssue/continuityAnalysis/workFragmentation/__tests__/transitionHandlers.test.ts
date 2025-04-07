import { createActivePeriod } from '../../utils/activePeriods/createActivePeriod'
import { handleTransitionToActive, handleTransitionFromActive } from '../transitionHandlers'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../../utils/activePeriods/createActivePeriod')

// Create cast mock variables
const mockCreateActivePeriod = createActivePeriod as jest.Mock

describe('transitionHandlers', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('handleTransitionToActive', () => {
		test('should return expected state when transitioning to active', () => {
			// Arrange
			const date = new Date('2023-01-02T00:00:00.000Z')

			// Act
			const result = handleTransitionToActive(date)

			// Assert
			expect(result).toEqual({
				newInActiveStatus: true,
				newActivePeriodStart: date,
				completedPeriod: null,
			})
		})
	})

	describe('handleTransitionFromActive', () => {
		test('should return expected state when transitioning from active', () => {
			// Arrange
			const activePeriodStart = new Date('2023-01-01T00:00:00.000Z')
			const transitionDate = new Date('2023-01-05T00:00:00.000Z')
			const currentStatus = 'In Progress'
			const currentAssignee = 'User 1'

			const mockActivePeriod: ActiveWorkPeriod = {
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-01-05T00:00:00.000Z',
				durationHours: 96, // 4 days = 96 hours
				status: 'In Progress',
				assignee: 'User 1',
			}

			// Mock return value
			mockCreateActivePeriod.mockReturnValue(mockActivePeriod)

			// Act
			const result = handleTransitionFromActive(activePeriodStart, transitionDate, currentStatus, currentAssignee)

			// Assert
			expect(result).toEqual({
				newInActiveStatus: false,
				newActivePeriodStart: null,
				completedPeriod: mockActivePeriod,
			})

			// Verify createActivePeriod was called with correct parameters
			expect(mockCreateActivePeriod).toHaveBeenCalledWith(
				activePeriodStart,
				transitionDate,
				currentStatus,
				currentAssignee,
			)
		})

		test('should handle null status and use "Unknown" as default', () => {
			// Arrange
			const activePeriodStart = new Date('2023-01-01T00:00:00.000Z')
			const transitionDate = new Date('2023-01-05T00:00:00.000Z')
			const currentStatus = null
			const currentAssignee = 'User 1'

			const mockActivePeriod: ActiveWorkPeriod = {
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-01-05T00:00:00.000Z',
				durationHours: 96, // 4 days = 96 hours
				status: 'Unknown',
				assignee: 'User 1',
			}

			// Mock return value
			mockCreateActivePeriod.mockReturnValue(mockActivePeriod)

			// Act
			const result = handleTransitionFromActive(activePeriodStart, transitionDate, currentStatus, currentAssignee)

			// Assert
			expect(result).toEqual({
				newInActiveStatus: false,
				newActivePeriodStart: null,
				completedPeriod: mockActivePeriod,
			})

			// Verify createActivePeriod was called with correct parameters, using "Unknown" for null status
			expect(mockCreateActivePeriod).toHaveBeenCalledWith(activePeriodStart, transitionDate, 'Unknown', currentAssignee)
		})

		test('should handle null assignee', () => {
			// Arrange
			const activePeriodStart = new Date('2023-01-01T00:00:00.000Z')
			const transitionDate = new Date('2023-01-05T00:00:00.000Z')
			const currentStatus = 'In Progress'
			const currentAssignee = null

			const mockActivePeriod: ActiveWorkPeriod = {
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-01-05T00:00:00.000Z',
				durationHours: 96, // 4 days = 96 hours
				status: 'In Progress',
				assignee: null,
			}

			// Mock return value
			mockCreateActivePeriod.mockReturnValue(mockActivePeriod)

			// Act
			const result = handleTransitionFromActive(activePeriodStart, transitionDate, currentStatus, currentAssignee)

			// Assert
			expect(result).toEqual({
				newInActiveStatus: false,
				newActivePeriodStart: null,
				completedPeriod: mockActivePeriod,
			})

			// Verify createActivePeriod was called with correct parameters
			expect(mockCreateActivePeriod).toHaveBeenCalledWith(activePeriodStart, transitionDate, currentStatus, null)
		})
	})
})
