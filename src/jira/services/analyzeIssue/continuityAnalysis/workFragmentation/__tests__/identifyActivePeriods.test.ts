import * as changelogProcessingModule from '../changelogProcessing'
import * as findActivePeriodsModule from '../findActivePeriods'
import { identifyActiveWorkPeriods } from '../identifyActivePeriods'
import * as noChangelogHandlingModule from '../noChangelogHandling'
import * as stateManagementModule from '../stateManagement'
import type { JiraIssue } from '../../../../../types/issue.types'
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

// Mock dependencies
jest.mock('../changelogProcessing')
jest.mock('../noChangelogHandling')
jest.mock('../stateManagement')
jest.mock('../findActivePeriods')

describe('identifyActiveWorkPeriods', () => {
	// Setup mocks
	const mockExtractStatusChanges = jest.spyOn(changelogProcessingModule, 'extractStatusChanges')
	const mockHandleIssueWithoutChangelog = jest.spyOn(noChangelogHandlingModule, 'handleIssueWithoutChangelog')
	const mockGetInitialState = jest.spyOn(stateManagementModule, 'getInitialState')
	const mockProcessStatusChangesToFindActivePeriods = jest.spyOn(
		findActivePeriodsModule,
		'processStatusChangesToFindActivePeriods',
	)

	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('should handle issue without changelog', () => {
		// Arrange
		const issueWithoutChangelog = {
			id: '12345',
			key: 'TEST-123',
		} as unknown as JiraIssue

		const mockActivePeriods: ActiveWorkPeriod[] = [
			{
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-01-05T00:00:00.000Z',
				durationHours: 96,
				status: 'In Progress',
				assignee: 'user1',
			},
		]

		// Set up mock returns
		mockHandleIssueWithoutChangelog.mockReturnValue(mockActivePeriods)

		// Act
		const result = identifyActiveWorkPeriods(issueWithoutChangelog)

		// Assert
		expect(result).toBe(mockActivePeriods)
		expect(mockHandleIssueWithoutChangelog).toHaveBeenCalledWith(issueWithoutChangelog)
		expect(mockExtractStatusChanges).not.toHaveBeenCalled()
		expect(mockGetInitialState).not.toHaveBeenCalled()
		expect(mockProcessStatusChangesToFindActivePeriods).not.toHaveBeenCalled()
	})

	test('should handle issue with empty changelog histories', () => {
		// Arrange
		const issueWithEmptyChangelog = {
			id: '12345',
			key: 'TEST-123',
			changelog: {
				histories: [],
			},
		} as unknown as JiraIssue

		const mockActivePeriods: ActiveWorkPeriod[] = [
			{
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-01-05T00:00:00.000Z',
				durationHours: 96,
				status: 'In Progress',
				assignee: 'user1',
			},
		]

		// Set up mock returns
		mockHandleIssueWithoutChangelog.mockReturnValue(mockActivePeriods)

		// Act
		const result = identifyActiveWorkPeriods(issueWithEmptyChangelog)

		// Assert
		expect(result).toBe(mockActivePeriods)
		expect(mockHandleIssueWithoutChangelog).toHaveBeenCalledWith(issueWithEmptyChangelog)
		expect(mockExtractStatusChanges).not.toHaveBeenCalled()
		expect(mockGetInitialState).not.toHaveBeenCalled()
		expect(mockProcessStatusChangesToFindActivePeriods).not.toHaveBeenCalled()
	})

	test('should process issue with changelog', () => {
		// Arrange
		const created = '2023-01-01T00:00:00.000Z'
		const issueWithChangelog = {
			id: '12345',
			key: 'TEST-123',
			fields: {
				created,
				status: { name: 'To Do' },
				assignee: { displayName: 'user1' },
			},
			changelog: {
				histories: [
					{
						id: '1',
						created: '2023-01-01T12:00:00.000Z',
						items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }],
					},
				],
			},
		} as unknown as JiraIssue

		const mockStatusChanges = [
			{
				date: new Date('2023-01-01T12:00:00.000Z'),
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				assignee: 'user1',
			},
		]

		const mockInitialState = {
			currentDate: new Date(created),
			currentStatus: 'To Do',
			currentAssignee: 'user1',
			inActiveStatus: false,
			activePeriodStart: null,
		}

		const mockActivePeriods: ActiveWorkPeriod[] = [
			{
				startDate: '2023-01-01T12:00:00.000Z',
				endDate: '2023-01-05T00:00:00.000Z',
				durationHours: 84,
				status: 'In Progress',
				assignee: 'user1',
			},
		]

		// Set up mock returns
		mockExtractStatusChanges.mockReturnValue(mockStatusChanges)
		mockGetInitialState.mockReturnValue(mockInitialState)
		mockProcessStatusChangesToFindActivePeriods.mockReturnValue(mockActivePeriods)

		// Act
		const result = identifyActiveWorkPeriods(issueWithChangelog)

		// Assert
		expect(result).toBe(mockActivePeriods)
		expect(mockHandleIssueWithoutChangelog).not.toHaveBeenCalled()
		expect(mockExtractStatusChanges).toHaveBeenCalledWith(issueWithChangelog)
		expect(mockGetInitialState).toHaveBeenCalledWith(issueWithChangelog)
		expect(mockProcessStatusChangesToFindActivePeriods).toHaveBeenCalledWith(
			issueWithChangelog,
			mockStatusChanges,
			mockInitialState,
		)
	})
})
