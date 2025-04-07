import { createActivePeriod } from '../../utils/activePeriods/createActivePeriod'
import { handleFinalActivePeriod } from '../activePeriodHandling'
import type { JiraIssue } from '../../../../../types/issue.types'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../../utils/activePeriods/createActivePeriod')

// Create cast mock variables
const mockCreateActivePeriod = createActivePeriod as jest.Mock

describe('handleFinalActivePeriod', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.useFakeTimers()
		jest.setSystemTime(new Date('2023-01-15T00:00:00.000Z'))
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	test('should return null when not in active status', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			fields: {},
		} as unknown as JiraIssue

		const state = {
			currentStatus: 'Done',
			currentAssignee: 'user1',
			inActiveStatus: false,
			activePeriodStart: new Date('2023-01-01T00:00:00.000Z'),
		}

		// Act
		const result = handleFinalActivePeriod(issue, state)

		// Assert
		expect(result).toBeNull()
		expect(mockCreateActivePeriod).not.toHaveBeenCalled()
	})

	test('should return null when activePeriodStart is null', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			fields: {},
		} as unknown as JiraIssue

		const state = {
			currentStatus: 'In Progress',
			currentAssignee: 'user1',
			inActiveStatus: true,
			activePeriodStart: null,
		}

		// Act
		const result = handleFinalActivePeriod(issue, state)

		// Assert
		expect(result).toBeNull()
		expect(mockCreateActivePeriod).not.toHaveBeenCalled()
	})

	test('should use resolutiondate when available', () => {
		// Arrange
		const resolutiondate = '2023-01-10T00:00:00.000Z'
		const issue = {
			id: '12345',
			key: 'TEST-123',
			fields: {
				resolutiondate,
			},
		} as unknown as JiraIssue

		const state = {
			currentStatus: 'In Progress',
			currentAssignee: 'user1',
			inActiveStatus: true,
			activePeriodStart: new Date('2023-01-01T00:00:00.000Z'),
		}

		const mockActivePeriod: ActiveWorkPeriod = {
			startDate: '2023-01-01T00:00:00.000Z',
			endDate: resolutiondate,
			durationHours: 216, // 9 days = 216 hours
			status: 'In Progress',
			assignee: 'user1',
		}

		mockCreateActivePeriod.mockReturnValue(mockActivePeriod)

		// Act
		const result = handleFinalActivePeriod(issue, state)

		// Assert
		expect(result).toEqual(mockActivePeriod)
		expect(mockCreateActivePeriod).toHaveBeenCalledWith(
			state.activePeriodStart,
			new Date(resolutiondate),
			state.currentStatus,
			state.currentAssignee,
		)
	})

	test('should use current date when resolutiondate is unavailable', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			fields: {},
		} as unknown as JiraIssue

		const state = {
			currentStatus: 'In Progress',
			currentAssignee: 'user1',
			inActiveStatus: true,
			activePeriodStart: new Date('2023-01-01T00:00:00.000Z'),
		}

		const mockActivePeriod: ActiveWorkPeriod = {
			startDate: '2023-01-01T00:00:00.000Z',
			endDate: '2023-01-15T00:00:00.000Z',
			durationHours: 336, // 14 days = 336 hours
			status: 'In Progress',
			assignee: 'user1',
		}

		mockCreateActivePeriod.mockReturnValue(mockActivePeriod)

		// Act
		const result = handleFinalActivePeriod(issue, state)

		// Assert
		expect(result).toEqual(mockActivePeriod)
		expect(mockCreateActivePeriod).toHaveBeenCalledWith(
			state.activePeriodStart,
			new Date('2023-01-15T00:00:00.000Z'), // current mocked date
			state.currentStatus,
			state.currentAssignee,
		)
	})

	test('should use "Unknown" when currentStatus is null', () => {
		// Arrange
		const issue = {
			id: '12345',
			key: 'TEST-123',
			fields: {},
		} as unknown as JiraIssue

		const state = {
			currentStatus: null,
			currentAssignee: 'user1',
			inActiveStatus: true,
			activePeriodStart: new Date('2023-01-01T00:00:00.000Z'),
		}

		const mockActivePeriod: ActiveWorkPeriod = {
			startDate: '2023-01-01T00:00:00.000Z',
			endDate: '2023-01-15T00:00:00.000Z',
			durationHours: 336, // 14 days = 336 hours
			status: 'Unknown',
			assignee: 'user1',
		}

		mockCreateActivePeriod.mockReturnValue(mockActivePeriod)

		// Act
		const result = handleFinalActivePeriod(issue, state)

		// Assert
		expect(result).toEqual(mockActivePeriod)
		expect(mockCreateActivePeriod).toHaveBeenCalledWith(
			state.activePeriodStart,
			new Date('2023-01-15T00:00:00.000Z'), // current mocked date
			'Unknown',
			state.currentAssignee,
		)
	})
})
