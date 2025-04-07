import { processStatusChange } from '../processStatusChange'
import * as stateManagementModule from '../stateManagement'
import * as stateTransitionDeterminationModule from '../stateTransitionDetermination'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../stateManagement')
jest.mock('../stateTransitionDetermination')

describe('processStatusChange', () => {
	// Setup mocks
	const mockDetermineStateTransition = jest.spyOn(stateTransitionDeterminationModule, 'determineStateTransition')
	const mockCreateNewState = jest.spyOn(stateManagementModule, 'createNewState')

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should process a status change and return new state with no completed period', () => {
		// Arrange
		const currentState = {
			currentDate: new Date('2023-01-01T00:00:00.000Z'),
			currentStatus: 'To Do',
			currentAssignee: 'User 1',
			inActiveStatus: false,
			activePeriodStart: null,
		}

		const statusChange = {
			date: new Date('2023-01-02T00:00:00.000Z'),
			fromStatus: 'To Do',
			toStatus: 'In Progress',
			assignee: 'User 1',
		}

		const transitionResult = {
			newActivePeriodStart: new Date('2023-01-02T00:00:00.000Z'),
			newInActiveStatus: true,
			completedPeriod: null,
		}

		const newState = {
			currentDate: new Date('2023-01-02T00:00:00.000Z'),
			currentStatus: 'In Progress',
			currentAssignee: 'User 1',
			inActiveStatus: true,
			activePeriodStart: new Date('2023-01-02T00:00:00.000Z'),
		}

		// Mock returns
		mockDetermineStateTransition.mockReturnValue(transitionResult)
		mockCreateNewState.mockReturnValue(newState)

		// Act
		const result = processStatusChange(currentState, statusChange)

		// Assert
		expect(result.completedPeriod).toBeNull()
		expect(result.newState).toEqual(newState)

		// Verify determineStateTransition was called correctly
		expect(mockDetermineStateTransition).toHaveBeenCalledWith(
			statusChange,
			currentState.inActiveStatus,
			currentState.activePeriodStart,
			currentState.currentStatus,
			currentState.currentAssignee,
		)

		// Verify createNewState was called correctly
		expect(mockCreateNewState).toHaveBeenCalledWith(
			statusChange,
			currentState.currentStatus,
			currentState.currentAssignee,
			transitionResult.newInActiveStatus,
			transitionResult.newActivePeriodStart,
		)
	})

	test('should process a status change and return new state with a completed period', () => {
		// Arrange
		const currentState = {
			currentDate: new Date('2023-01-02T00:00:00.000Z'),
			currentStatus: 'In Progress',
			currentAssignee: 'User 1',
			inActiveStatus: true,
			activePeriodStart: new Date('2023-01-02T00:00:00.000Z'),
		}

		const statusChange = {
			date: new Date('2023-01-05T00:00:00.000Z'),
			fromStatus: 'In Progress',
			toStatus: 'Done',
			assignee: 'User 1',
		}

		const completedPeriod: ActiveWorkPeriod = {
			startDate: '2023-01-02T00:00:00.000Z',
			endDate: '2023-01-05T00:00:00.000Z',
			durationHours: 72, // 3 days = 72 hours
			status: 'In Progress',
			assignee: 'User 1',
		}

		const transitionResult = {
			newActivePeriodStart: null,
			newInActiveStatus: false,
			completedPeriod,
		}

		const newState = {
			currentDate: new Date('2023-01-05T00:00:00.000Z'),
			currentStatus: 'Done',
			currentAssignee: 'User 1',
			inActiveStatus: false,
			activePeriodStart: null,
		}

		// Mock returns
		mockDetermineStateTransition.mockReturnValue(transitionResult)
		mockCreateNewState.mockReturnValue(newState)

		// Act
		const result = processStatusChange(currentState, statusChange)

		// Assert
		expect(result.completedPeriod).toEqual(completedPeriod)
		expect(result.newState).toEqual(newState)

		// Verify determineStateTransition was called correctly
		expect(mockDetermineStateTransition).toHaveBeenCalledWith(
			statusChange,
			currentState.inActiveStatus,
			currentState.activePeriodStart,
			currentState.currentStatus,
			currentState.currentAssignee,
		)

		// Verify createNewState was called correctly
		expect(mockCreateNewState).toHaveBeenCalledWith(
			statusChange,
			currentState.currentStatus,
			currentState.currentAssignee,
			transitionResult.newInActiveStatus,
			transitionResult.newActivePeriodStart,
		)
	})

	test('should handle null values in current state', () => {
		// Arrange
		const currentState = {
			currentDate: new Date('2023-01-01T00:00:00.000Z'),
			currentStatus: null,
			currentAssignee: null,
			inActiveStatus: false,
			activePeriodStart: null,
		}

		const statusChange = {
			date: new Date('2023-01-02T00:00:00.000Z'),
			fromStatus: null,
			toStatus: 'To Do',
			assignee: 'User 1',
		}

		const transitionResult = {
			newActivePeriodStart: null,
			newInActiveStatus: false,
			completedPeriod: null,
		}

		const newState = {
			currentDate: new Date('2023-01-02T00:00:00.000Z'),
			currentStatus: 'To Do',
			currentAssignee: 'User 1',
			inActiveStatus: false,
			activePeriodStart: null,
		}

		// Mock returns
		mockDetermineStateTransition.mockReturnValue(transitionResult)
		mockCreateNewState.mockReturnValue(newState)

		// Act
		const result = processStatusChange(currentState, statusChange)

		// Assert
		expect(result.completedPeriod).toBeNull()
		expect(result.newState).toEqual(newState)

		// Verify determineStateTransition was called correctly with null values
		expect(mockDetermineStateTransition).toHaveBeenCalledWith(
			statusChange,
			currentState.inActiveStatus,
			currentState.activePeriodStart,
			null,
			null,
		)

		// Verify createNewState was called correctly
		expect(mockCreateNewState).toHaveBeenCalledWith(
			statusChange,
			null,
			null,
			transitionResult.newInActiveStatus,
			transitionResult.newActivePeriodStart,
		)
	})
})
