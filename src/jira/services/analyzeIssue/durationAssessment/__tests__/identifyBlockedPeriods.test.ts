import { extractBlockingReasons } from '../extractBlockingReasons'
import { extractStatusTransitions } from '../extractStatusTransitions'
import { identifyBlockedPeriods } from '../identifyBlockedPeriods'
import { processBlockedTransition } from '../processBlockedTransition'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { BlockedPeriod, StatusTransition } from '../types/durationAssessment.types'

// Mock dependencies
jest.mock('../extractStatusTransitions')
jest.mock('../processBlockedTransition')
jest.mock('../extractBlockingReasons')

describe('identifyBlockedPeriods', () => {
	// Reset mocks before each test
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should process transitions to identify blocked periods', () => {
		// Mock data
		const issue = {} as JiraIssue
		const commentsResponse = {
			comments: [],
			startAt: 0,
			maxResults: 0,
			total: 0,
		} as IssueCommentResponse

		// Mock transitions
		const transitions: StatusTransition[] = [
			{
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				fromStatusCategory: 'To Do',
				toStatusCategory: 'In Progress',
				timestamp: '2023-01-01T12:00:00.000Z',
			},
			{
				fromStatus: 'In Progress',
				toStatus: 'Blocked',
				fromStatusCategory: 'In Progress',
				toStatusCategory: 'Blocked',
				timestamp: '2023-01-02T12:00:00.000Z',
			},
			{
				fromStatus: 'Blocked',
				toStatus: 'In Progress',
				fromStatusCategory: 'Blocked',
				toStatusCategory: 'In Progress',
				timestamp: '2023-01-05T12:00:00.000Z',
			},
		]

		// Configure mocks
		const blockedPeriod: BlockedPeriod = {
			startTime: '2023-01-02T12:00:00.000Z',
			endTime: '2023-01-05T12:00:00.000Z',
			reason: null,
		}

		const mockExtractStatusTransitions = extractStatusTransitions as jest.Mock
		mockExtractStatusTransitions.mockReturnValue(transitions)

		const mockProcessBlockedTransition = processBlockedTransition as jest.Mock
		mockProcessBlockedTransition
			.mockReturnValueOnce(null) // First transition: To Do -> In Progress
			.mockReturnValueOnce({
				// Second transition: In Progress -> Blocked
				startTime: '2023-01-02T12:00:00.000Z',
				endTime: null,
				reason: null,
			})
			.mockReturnValueOnce(null) // Third transition: Blocked -> In Progress

		const mockExtractBlockingReasons = extractBlockingReasons as jest.Mock
		mockExtractBlockingReasons.mockReturnValue([blockedPeriod])

		// Call the function
		const result = identifyBlockedPeriods(issue, commentsResponse)

		// Verify results
		expect(extractStatusTransitions).toHaveBeenCalledWith(issue)
		expect(processBlockedTransition).toHaveBeenCalledTimes(3)
		expect(extractBlockingReasons).toHaveBeenCalled()
		expect(result).toEqual([blockedPeriod])
	})

	it('should handle an ongoing blocked period', () => {
		// Mock data
		const issue = {} as JiraIssue
		const commentsResponse = {
			comments: [],
			startAt: 0,
			maxResults: 0,
			total: 0,
		} as IssueCommentResponse

		// Mock transitions
		const transitions: StatusTransition[] = [
			{
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				fromStatusCategory: 'To Do',
				toStatusCategory: 'In Progress',
				timestamp: '2023-01-01T12:00:00.000Z',
			},
			{
				fromStatus: 'In Progress',
				toStatus: 'Blocked',
				fromStatusCategory: 'In Progress',
				toStatusCategory: 'Blocked',
				timestamp: '2023-01-02T12:00:00.000Z',
			},
		]

		// The ongoing blocked period
		const ongoingBlockedPeriod: BlockedPeriod = {
			startTime: '2023-01-02T12:00:00.000Z',
			endTime: null,
			reason: null,
		}

		// Configure mocks
		const mockExtractStatusTransitions = extractStatusTransitions as jest.Mock
		mockExtractStatusTransitions.mockReturnValue(transitions)

		const mockProcessBlockedTransition = processBlockedTransition as jest.Mock
		mockProcessBlockedTransition
			.mockReturnValueOnce(null) // First transition: To Do -> In Progress
			.mockReturnValueOnce(ongoingBlockedPeriod) // Second transition: In Progress -> Blocked

		const mockExtractBlockingReasons = extractBlockingReasons as jest.Mock
		mockExtractBlockingReasons.mockImplementation((blockedPeriods) => blockedPeriods)

		// Call the function
		const result = identifyBlockedPeriods(issue, commentsResponse)

		// Verify results
		expect(extractStatusTransitions).toHaveBeenCalledWith(issue)
		expect(processBlockedTransition).toHaveBeenCalledTimes(2)
		expect(extractBlockingReasons).toHaveBeenCalled()

		// Since the blocked period is ongoing, it should be added to the result
		expect(result).toContainEqual(ongoingBlockedPeriod)
	})
})
