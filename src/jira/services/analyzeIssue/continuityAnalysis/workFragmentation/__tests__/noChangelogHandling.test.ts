import { createWorkPeriodFromDates } from '../../utils/activePeriods/createWorkPeriodFromDates'
import { isActiveStatus } from '../../utils/isActiveStatus'
import { calculateIssueDates } from '../../utils/issueDates/calculateIssueDates'
import { handleIssueWithoutChangelog } from '../noChangelogHandling'
import type { JiraIssue } from '../../../../../types/issue.types'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../../utils/activePeriods/createWorkPeriodFromDates')
jest.mock('../../utils/isActiveStatus')
jest.mock('../../utils/issueDates/calculateIssueDates')

const mockIsActiveStatus = isActiveStatus as jest.Mock
const mockCalculateIssueDates = calculateIssueDates as jest.Mock
const mockCreateWorkPeriodFromDates = createWorkPeriodFromDates as jest.Mock

describe('handleIssueWithoutChangelog', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})
	test('should return empty array if issue has no status', () => {
		// Arrange
		const issue = {
			fields: {
				status: null,
			},
		} as unknown as JiraIssue

		mockIsActiveStatus.mockReturnValue(false)

		// Act
		const result = handleIssueWithoutChangelog(issue)

		// Assert
		expect(result).toEqual([])
		expect(mockIsActiveStatus).not.toHaveBeenCalled()
		expect(mockCalculateIssueDates).not.toHaveBeenCalled()
		expect(mockCreateWorkPeriodFromDates).not.toHaveBeenCalled()
	})

	test('should return empty array if status is not active', () => {
		// Arrange
		const issue = {
			fields: {
				status: {
					name: 'Closed',
				},
			},
		} as unknown as JiraIssue

		mockIsActiveStatus.mockReturnValue(false)

		// Act
		const result = handleIssueWithoutChangelog(issue)

		// Assert
		expect(result).toEqual([])
		expect(mockIsActiveStatus).toHaveBeenCalledWith('Closed')
		expect(mockCalculateIssueDates).not.toHaveBeenCalled()
		expect(mockCreateWorkPeriodFromDates).not.toHaveBeenCalled()
	})

	test('should create work period if status is active and assignee exists', () => {
		// Arrange
		const issue = {
			fields: {
				status: {
					name: 'In Progress',
				},
				assignee: {
					displayName: 'John Doe',
				},
			},
		} as unknown as JiraIssue

		const mockDates = {
			startDate: new Date('2023-01-01'),
			endDate: new Date('2023-01-31'),
		}

		const mockWorkPeriod: ActiveWorkPeriod = {
			status: 'In Progress',
			assignee: 'John Doe',
			startDate: '2023-01-01T00:00:00.000Z',
			endDate: '2023-01-31T00:00:00.000Z',
			durationHours: 720, // 30 days * 24 hours
		}

		mockIsActiveStatus.mockReturnValue(true)
		mockCalculateIssueDates.mockReturnValue(mockDates)
		mockCreateWorkPeriodFromDates.mockReturnValue(mockWorkPeriod)

		// Act
		const result = handleIssueWithoutChangelog(issue)

		// Assert
		expect(result).toEqual([mockWorkPeriod])
		expect(mockIsActiveStatus).toHaveBeenCalledWith('In Progress')
		expect(mockCalculateIssueDates).toHaveBeenCalledWith(issue)
		expect(mockCreateWorkPeriodFromDates).toHaveBeenCalledWith(
			mockDates.startDate,
			mockDates.endDate,
			'In Progress',
			'John Doe',
		)
	})

	test('should create work period if status is active but assignee is missing', () => {
		// Arrange
		const issue = {
			fields: {
				status: {
					name: 'In Progress',
				},
				assignee: null,
			},
		} as unknown as JiraIssue

		const mockDates = {
			startDate: new Date('2023-01-01'),
			endDate: new Date('2023-01-31'),
		}

		const mockWorkPeriod: ActiveWorkPeriod = {
			status: 'In Progress',
			assignee: null,
			startDate: '2023-01-01T00:00:00.000Z',
			endDate: '2023-01-31T00:00:00.000Z',
			durationHours: 720, // 30 days * 24 hours
		}

		mockIsActiveStatus.mockReturnValue(true)
		mockCalculateIssueDates.mockReturnValue(mockDates)
		mockCreateWorkPeriodFromDates.mockReturnValue(mockWorkPeriod)

		// Act
		const result = handleIssueWithoutChangelog(issue)

		// Assert
		expect(result).toEqual([mockWorkPeriod])
		expect(mockIsActiveStatus).toHaveBeenCalledWith('In Progress')
		expect(mockCalculateIssueDates).toHaveBeenCalledWith(issue)
		expect(mockCreateWorkPeriodFromDates).toHaveBeenCalledWith(
			mockDates.startDate,
			mockDates.endDate,
			'In Progress',
			null,
		)
	})
})
