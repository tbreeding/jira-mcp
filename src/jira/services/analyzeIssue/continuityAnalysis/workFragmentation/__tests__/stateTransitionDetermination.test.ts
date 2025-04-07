import { determineStateTransition } from '../stateTransitionDetermination'
import * as transitionDetectionModule from '../transitionDetection'
import * as transitionHandlersModule from '../transitionHandlers'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../transitionDetection')
jest.mock('../transitionHandlers')

describe('determineStateTransition', () => {
	// Setup mocks
	const mockIsTransitionToActive = jest.spyOn(transitionDetectionModule, 'isTransitionToActive')
	const mockIsTransitionFromActive = jest.spyOn(transitionDetectionModule, 'isTransitionFromActive')
	const mockHandleTransitionToActive = jest.spyOn(transitionHandlersModule, 'handleTransitionToActive')
	const mockHandleTransitionFromActive = jest.spyOn(transitionHandlersModule, 'handleTransitionFromActive')

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should handle transition to active status', () => {
		// Arrange
		const change = {
			date: new Date('2023-01-02T00:00:00.000Z'),
			toStatus: 'In Progress',
		}
		const inActiveStatus = false
		const activePeriodStart = null
		const currentStatus = 'To Do'
		const currentAssignee = 'User 1'

		const transitionToActiveResult = {
			newInActiveStatus: true,
			newActivePeriodStart: new Date('2023-01-02T00:00:00.000Z'),
			completedPeriod: null,
		}

		// Mock returns
		mockIsTransitionToActive.mockReturnValue(true)
		mockIsTransitionFromActive.mockReturnValue(false)
		mockHandleTransitionToActive.mockReturnValue(transitionToActiveResult)

		// Act
		const result = determineStateTransition(change, inActiveStatus, activePeriodStart, currentStatus, currentAssignee)

		// Assert
		expect(result).toEqual(transitionToActiveResult)

		// Verify function calls
		expect(mockIsTransitionToActive).toHaveBeenCalledWith(inActiveStatus, change.toStatus)
		expect(mockHandleTransitionToActive).toHaveBeenCalledWith(change.date)
		expect(mockIsTransitionFromActive).not.toHaveBeenCalled()
		expect(mockHandleTransitionFromActive).not.toHaveBeenCalled()
	})

	test('should handle transition from active status', () => {
		// Arrange
		const change = {
			date: new Date('2023-01-05T00:00:00.000Z'),
			toStatus: 'Done',
		}
		const inActiveStatus = true
		const activePeriodStart = new Date('2023-01-02T00:00:00.000Z')
		const currentStatus = 'In Progress'
		const currentAssignee = 'User 1'

		const completedPeriod: ActiveWorkPeriod = {
			startDate: '2023-01-02T00:00:00.000Z',
			endDate: '2023-01-05T00:00:00.000Z',
			durationHours: 72, // 3 days = 72 hours
			status: 'In Progress',
			assignee: 'User 1',
		}

		const transitionFromActiveResult = {
			newInActiveStatus: false,
			newActivePeriodStart: null,
			completedPeriod,
		}

		// Mock returns
		mockIsTransitionToActive.mockReturnValue(false)
		mockIsTransitionFromActive.mockReturnValue(true)
		mockHandleTransitionFromActive.mockReturnValue(transitionFromActiveResult)

		// Act
		const result = determineStateTransition(change, inActiveStatus, activePeriodStart, currentStatus, currentAssignee)

		// Assert
		expect(result).toEqual(transitionFromActiveResult)

		// Verify function calls
		expect(mockIsTransitionToActive).toHaveBeenCalledWith(inActiveStatus, change.toStatus)
		expect(mockIsTransitionFromActive).toHaveBeenCalledWith(inActiveStatus, activePeriodStart, change.toStatus)
		expect(mockHandleTransitionFromActive).toHaveBeenCalledWith(
			activePeriodStart,
			change.date,
			currentStatus,
			currentAssignee,
		)
	})

	test('should handle no status change affecting activity', () => {
		// Arrange
		const change = {
			date: new Date('2023-01-03T00:00:00.000Z'),
			toStatus: 'In Progress',
		}
		const inActiveStatus = true
		const activePeriodStart = new Date('2023-01-02T00:00:00.000Z')
		const currentStatus = 'In Progress'
		const currentAssignee = 'User 1'

		// Mock returns
		mockIsTransitionToActive.mockReturnValue(false)
		mockIsTransitionFromActive.mockReturnValue(false)

		// Act
		const result = determineStateTransition(change, inActiveStatus, activePeriodStart, currentStatus, currentAssignee)

		// Assert
		expect(result).toEqual({
			newInActiveStatus: inActiveStatus,
			newActivePeriodStart: activePeriodStart,
			completedPeriod: null,
		})

		// Verify function calls
		expect(mockIsTransitionToActive).toHaveBeenCalledWith(inActiveStatus, change.toStatus)
		expect(mockIsTransitionFromActive).toHaveBeenCalledWith(inActiveStatus, activePeriodStart, change.toStatus)
		expect(mockHandleTransitionToActive).not.toHaveBeenCalled()
		expect(mockHandleTransitionFromActive).not.toHaveBeenCalled()
	})

	test('should handle null values', () => {
		// Arrange
		const change = {
			date: new Date('2023-01-03T00:00:00.000Z'),
			toStatus: null,
		}
		const inActiveStatus = false
		const activePeriodStart = null
		const currentStatus = null
		const currentAssignee = null

		// Mock returns
		mockIsTransitionToActive.mockReturnValue(false)
		mockIsTransitionFromActive.mockReturnValue(false)

		// Act
		const result = determineStateTransition(change, inActiveStatus, activePeriodStart, currentStatus, currentAssignee)

		// Assert
		expect(result).toEqual({
			newInActiveStatus: inActiveStatus,
			newActivePeriodStart: activePeriodStart,
			completedPeriod: null,
		})

		// Verify function calls
		expect(mockIsTransitionToActive).toHaveBeenCalledWith(inActiveStatus, change.toStatus)
		expect(mockIsTransitionFromActive).toHaveBeenCalledWith(inActiveStatus, activePeriodStart, change.toStatus)
	})
})
