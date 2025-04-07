import * as activePeriodHandlingModule from '../activePeriodHandling'
import { processStatusChangesToFindActivePeriods } from '../findActivePeriods'
import * as processStatusChangeModule from '../processStatusChange'
import type { JiraIssue } from '../../../../../types/issue.types'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../activePeriodHandling')
jest.mock('../processStatusChange')

describe('processStatusChangesToFindActivePeriods', () => {
	// Setup mocks
	const mockHandleFinalActivePeriod = jest.spyOn(activePeriodHandlingModule, 'handleFinalActivePeriod')
	const mockProcessStatusChange = jest.spyOn(processStatusChangeModule, 'processStatusChange')

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should process status changes and find active periods', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			fields: {},
		} as unknown as JiraIssue

		const statusChanges = [
			{
				date: new Date('2023-01-01T00:00:00.000Z'),
				fromStatus: null,
				toStatus: 'To Do',
				assignee: 'User 1',
			},
			{
				date: new Date('2023-01-02T00:00:00.000Z'),
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				assignee: 'User 1',
			},
			{
				date: new Date('2023-01-05T00:00:00.000Z'),
				fromStatus: 'In Progress',
				toStatus: 'Done',
				assignee: 'User 1',
			},
		]

		const initialState = {
			currentDate: new Date('2023-01-01T00:00:00.000Z'),
			currentStatus: null,
			currentAssignee: null,
			inActiveStatus: false,
			activePeriodStart: null,
		}

		const mockActivePeriod: ActiveWorkPeriod = {
			startDate: '2023-01-02T00:00:00.000Z',
			endDate: '2023-01-05T00:00:00.000Z',
			durationHours: 72, // 3 days = 72 hours
			status: 'In Progress',
			assignee: 'User 1',
		}

		// State transition for first status change (To Do)
		const firstChangeResult = {
			newState: {
				currentDate: new Date('2023-01-01T00:00:00.000Z'),
				currentStatus: 'To Do',
				currentAssignee: 'User 1',
				inActiveStatus: false,
				activePeriodStart: null,
			},
			completedPeriod: null,
		}

		// State transition for second status change (In Progress)
		const secondChangeResult = {
			newState: {
				currentDate: new Date('2023-01-02T00:00:00.000Z'),
				currentStatus: 'In Progress',
				currentAssignee: 'User 1',
				inActiveStatus: true,
				activePeriodStart: new Date('2023-01-02T00:00:00.000Z'),
			},
			completedPeriod: null,
		}

		// State transition for third status change (Done)
		const thirdChangeResult = {
			newState: {
				currentDate: new Date('2023-01-05T00:00:00.000Z'),
				currentStatus: 'Done',
				currentAssignee: 'User 1',
				inActiveStatus: false,
				activePeriodStart: null,
			},
			completedPeriod: mockActivePeriod,
		}

		// Mock processStatusChange returns
		mockProcessStatusChange
			.mockReturnValueOnce(firstChangeResult)
			.mockReturnValueOnce(secondChangeResult)
			.mockReturnValueOnce(thirdChangeResult)

		// Mock handleFinalActivePeriod returns
		mockHandleFinalActivePeriod.mockReturnValue(null) // No final active period

		// Act
		const result = processStatusChangesToFindActivePeriods(issue, statusChanges, initialState)

		// Assert
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual(mockActivePeriod)

		// Verify processStatusChange calls
		expect(mockProcessStatusChange).toHaveBeenCalledTimes(3)
		expect(mockProcessStatusChange).toHaveBeenNthCalledWith(1, initialState, statusChanges[0])
		expect(mockProcessStatusChange).toHaveBeenNthCalledWith(2, firstChangeResult.newState, statusChanges[1])
		expect(mockProcessStatusChange).toHaveBeenNthCalledWith(3, secondChangeResult.newState, statusChanges[2])

		// Verify handleFinalActivePeriod call
		expect(mockHandleFinalActivePeriod).toHaveBeenCalledTimes(1)
		expect(mockHandleFinalActivePeriod).toHaveBeenCalledWith(issue, thirdChangeResult.newState)
	})

	test('should include final active period if one exists', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			fields: {},
		} as unknown as JiraIssue

		const statusChanges = [
			{
				date: new Date('2023-01-01T00:00:00.000Z'),
				fromStatus: null,
				toStatus: 'To Do',
				assignee: 'User 1',
			},
			{
				date: new Date('2023-01-02T00:00:00.000Z'),
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				assignee: 'User 1',
			},
		]

		const initialState = {
			currentDate: new Date('2023-01-01T00:00:00.000Z'),
			currentStatus: null,
			currentAssignee: null,
			inActiveStatus: false,
			activePeriodStart: null,
		}

		// State transition for first status change (To Do)
		const firstChangeResult = {
			newState: {
				currentDate: new Date('2023-01-01T00:00:00.000Z'),
				currentStatus: 'To Do',
				currentAssignee: 'User 1',
				inActiveStatus: false,
				activePeriodStart: null,
			},
			completedPeriod: null,
		}

		// State transition for second status change (In Progress)
		const secondChangeResult = {
			newState: {
				currentDate: new Date('2023-01-02T00:00:00.000Z'),
				currentStatus: 'In Progress',
				currentAssignee: 'User 1',
				inActiveStatus: true,
				activePeriodStart: new Date('2023-01-02T00:00:00.000Z'),
			},
			completedPeriod: null,
		}

		const finalActivePeriod: ActiveWorkPeriod = {
			startDate: '2023-01-02T00:00:00.000Z',
			endDate: '2023-01-10T00:00:00.000Z', // Issue completed on Jan 10
			durationHours: 192, // 8 days = 192 hours
			status: 'In Progress',
			assignee: 'User 1',
		}

		// Mock processStatusChange returns
		mockProcessStatusChange.mockReturnValueOnce(firstChangeResult).mockReturnValueOnce(secondChangeResult)

		// Mock handleFinalActivePeriod returns
		mockHandleFinalActivePeriod.mockReturnValue(finalActivePeriod)

		// Act
		const result = processStatusChangesToFindActivePeriods(issue, statusChanges, initialState)

		// Assert
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual(finalActivePeriod)

		// Verify processStatusChange calls
		expect(mockProcessStatusChange).toHaveBeenCalledTimes(2)
		expect(mockProcessStatusChange).toHaveBeenNthCalledWith(1, initialState, statusChanges[0])
		expect(mockProcessStatusChange).toHaveBeenNthCalledWith(2, firstChangeResult.newState, statusChanges[1])

		// Verify handleFinalActivePeriod call
		expect(mockHandleFinalActivePeriod).toHaveBeenCalledTimes(1)
		expect(mockHandleFinalActivePeriod).toHaveBeenCalledWith(issue, secondChangeResult.newState)
	})

	test('should handle multiple completed periods during processing', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			fields: {},
		} as unknown as JiraIssue

		const statusChanges = [
			{
				date: new Date('2023-01-01T00:00:00.000Z'),
				fromStatus: null,
				toStatus: 'In Progress',
				assignee: 'User 1',
			},
			{
				date: new Date('2023-01-03T00:00:00.000Z'),
				fromStatus: 'In Progress',
				toStatus: 'Code Review',
				assignee: 'User 1',
			},
			{
				date: new Date('2023-01-04T00:00:00.000Z'),
				fromStatus: 'Code Review',
				toStatus: 'In Progress',
				assignee: 'User 1',
			},
			{
				date: new Date('2023-01-06T00:00:00.000Z'),
				fromStatus: 'In Progress',
				toStatus: 'Done',
				assignee: 'User 1',
			},
		]

		const initialState = {
			currentDate: new Date('2023-01-01T00:00:00.000Z'),
			currentStatus: null,
			currentAssignee: null,
			inActiveStatus: false,
			activePeriodStart: null,
		}

		const firstActivePeriod: ActiveWorkPeriod = {
			startDate: '2023-01-01T00:00:00.000Z',
			endDate: '2023-01-03T00:00:00.000Z',
			durationHours: 48,
			status: 'In Progress',
			assignee: 'User 1',
		}

		const secondActivePeriod: ActiveWorkPeriod = {
			startDate: '2023-01-04T00:00:00.000Z',
			endDate: '2023-01-06T00:00:00.000Z',
			durationHours: 48,
			status: 'In Progress',
			assignee: 'User 1',
		}

		// Mock state transitions and completed periods
		mockProcessStatusChange
			.mockReturnValueOnce({
				newState: {
					currentDate: new Date('2023-01-01T00:00:00.000Z'),
					currentStatus: 'In Progress',
					currentAssignee: 'User 1',
					inActiveStatus: true,
					activePeriodStart: new Date('2023-01-01T00:00:00.000Z'),
				},
				completedPeriod: null,
			})
			.mockReturnValueOnce({
				newState: {
					currentDate: new Date('2023-01-03T00:00:00.000Z'),
					currentStatus: 'Code Review',
					currentAssignee: 'User 1',
					inActiveStatus: false,
					activePeriodStart: null,
				},
				completedPeriod: firstActivePeriod,
			})
			.mockReturnValueOnce({
				newState: {
					currentDate: new Date('2023-01-04T00:00:00.000Z'),
					currentStatus: 'In Progress',
					currentAssignee: 'User 1',
					inActiveStatus: true,
					activePeriodStart: new Date('2023-01-04T00:00:00.000Z'),
				},
				completedPeriod: null,
			})
			.mockReturnValueOnce({
				newState: {
					currentDate: new Date('2023-01-06T00:00:00.000Z'),
					currentStatus: 'Done',
					currentAssignee: 'User 1',
					inActiveStatus: false,
					activePeriodStart: null,
				},
				completedPeriod: secondActivePeriod,
			})

		mockHandleFinalActivePeriod.mockReturnValue(null)

		// Act
		const result = processStatusChangesToFindActivePeriods(issue, statusChanges, initialState)

		// Assert
		expect(result).toHaveLength(2)
		expect(result[0]).toEqual(firstActivePeriod)
		expect(result[1]).toEqual(secondActivePeriod)

		// Verify processStatusChange calls
		expect(mockProcessStatusChange).toHaveBeenCalledTimes(4)

		// Verify handleFinalActivePeriod call
		expect(mockHandleFinalActivePeriod).toHaveBeenCalledTimes(1)
	})

	test('should handle empty status changes', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			fields: {},
		} as unknown as JiraIssue

		const statusChanges: Array<{
			date: Date
			fromStatus: string | null
			toStatus: string | null
			assignee: string | null
		}> = []

		const initialState = {
			currentDate: new Date('2023-01-01T00:00:00.000Z'),
			currentStatus: null,
			currentAssignee: null,
			inActiveStatus: false,
			activePeriodStart: null,
		}

		const finalActivePeriod: ActiveWorkPeriod = {
			startDate: '2023-01-01T00:00:00.000Z',
			endDate: '2023-01-10T00:00:00.000Z',
			durationHours: 216,
			status: 'Unknown',
			assignee: null,
		}

		// Since there are no status changes, only the final active period check should run
		mockHandleFinalActivePeriod.mockReturnValue(finalActivePeriod)

		// Act
		const result = processStatusChangesToFindActivePeriods(issue, statusChanges, initialState)

		// Assert
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual(finalActivePeriod)

		// Verify no processStatusChange calls
		expect(mockProcessStatusChange).not.toHaveBeenCalled()

		// Verify handleFinalActivePeriod call
		expect(mockHandleFinalActivePeriod).toHaveBeenCalledTimes(1)
		expect(mockHandleFinalActivePeriod).toHaveBeenCalledWith(issue, initialState)
	})
})
