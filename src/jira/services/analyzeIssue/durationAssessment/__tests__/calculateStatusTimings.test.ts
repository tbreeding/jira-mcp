import { calculateHoursPerStatus } from '../calculateHoursPerStatus'
import { calculateStatusTimings } from '../calculateStatusTimings'
import { convertTransitionsToPeriods } from '../convertTransitionsToPeriods'
import { extractStatusTransitions } from '../extractStatusTransitions'
import type { JiraIssue } from '../../../../types/issue.types'
import type { StatusPeriod, StatusTransition } from '../types/durationAssessment.types'

// Mock dependencies
jest.mock('../extractStatusTransitions')
jest.mock('../convertTransitionsToPeriods')
jest.mock('../calculateHoursPerStatus')

describe('calculateStatusTimings', () => {
	const mockExtractStatusTransitions = extractStatusTransitions as jest.MockedFunction<typeof extractStatusTransitions>
	const mockConvertTransitionsToPeriods = convertTransitionsToPeriods as jest.MockedFunction<
		typeof convertTransitionsToPeriods
	>
	const mockCalculateHoursPerStatus = calculateHoursPerStatus as jest.MockedFunction<typeof calculateHoursPerStatus>

	// Reset mocks before each test
	beforeEach(() => {
		jest.resetAllMocks()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('should return empty object when issue has no transitions', () => {
		mockExtractStatusTransitions.mockReturnValue([])

		const mockIssue = {} as unknown as JiraIssue

		expect(calculateStatusTimings(mockIssue)).toEqual({})
		expect(mockExtractStatusTransitions).toHaveBeenCalledWith(mockIssue)
		expect(mockConvertTransitionsToPeriods).not.toHaveBeenCalled()
		expect(mockCalculateHoursPerStatus).not.toHaveBeenCalled()
	})

	it('should process transitions through all helper functions', () => {
		// Setup
		const mockIssue = {} as unknown as JiraIssue

		const mockTransitions: StatusTransition[] = [
			{
				fromStatus: null,
				toStatus: 'To Do',
				fromStatusCategory: null,
				toStatusCategory: 'new',
				timestamp: '2023-01-01T10:00:00.000Z',
			},
			{
				fromStatus: 'To Do',
				toStatus: 'In Progress',
				fromStatusCategory: 'new',
				toStatusCategory: 'indeterminate',
				timestamp: '2023-01-05T14:00:00.000Z',
			},
		]

		const mockPeriods: StatusPeriod[] = [
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
				endTime: null,
			},
		]

		const mockHoursResult = {
			'To Do': 100,
			'In Progress': 115,
		}

		mockExtractStatusTransitions.mockReturnValue(mockTransitions)
		mockConvertTransitionsToPeriods.mockReturnValue(mockPeriods)
		mockCalculateHoursPerStatus.mockReturnValue(mockHoursResult)

		// Execute
		const result = calculateStatusTimings(mockIssue)

		// Verify
		expect(mockExtractStatusTransitions).toHaveBeenCalledWith(mockIssue)
		expect(mockConvertTransitionsToPeriods).toHaveBeenCalledWith(mockTransitions)
		expect(mockCalculateHoursPerStatus).toHaveBeenCalledWith(mockPeriods)

		expect(result).toBe(mockHoursResult)
	})
})
