import { assessBlockedTime } from '../assessBlockedTime'
import { calculateTotalBlockedDays } from '../calculateTotalBlockedDays'
import { extractUniqueReasons } from '../extractUniqueReasons'
import { identifyBlockedPeriods } from '../identifyBlockedPeriods'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { BlockedPeriod } from '../types/durationAssessment.types'

// Mock dependencies
jest.mock('../identifyBlockedPeriods')
jest.mock('../calculateTotalBlockedDays')
jest.mock('../extractUniqueReasons')

describe('assessBlockedTime', () => {
	// Setup
	beforeEach(() => {
		jest.resetAllMocks()
	})

	it('should correctly assemble blocked time assessment from component functions', () => {
		// Mock data
		const mockIssue = {} as JiraIssue
		const mockComments = {} as IssueCommentResponse

		// Mock blocked periods that would be returned by identifyBlockedPeriods
		const mockBlockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T10:00:00.000Z',
				endTime: '2023-01-03T10:00:00.000Z',
				reason: 'Waiting for approval',
			},
			{
				startTime: '2023-01-10T10:00:00.000Z',
				endTime: '2023-01-15T10:00:00.000Z',
				reason: 'Blocked by technical issue',
			},
		]

		// Set up mock return values
		jest.mocked(identifyBlockedPeriods).mockReturnValue(mockBlockedPeriods)
		jest.mocked(calculateTotalBlockedDays).mockReturnValue(7)
		jest.mocked(extractUniqueReasons).mockReturnValue(['Waiting for approval', 'Blocked by technical issue'])

		// Execute the function
		const result = assessBlockedTime(mockIssue, mockComments)

		// Verify result
		expect(result).toEqual({
			totalDays: 7,
			reasons: ['Waiting for approval', 'Blocked by technical issue'],
		})

		// Verify that all component functions were called with correct parameters
		expect(identifyBlockedPeriods).toHaveBeenCalledWith(mockIssue, mockComments)
		expect(calculateTotalBlockedDays).toHaveBeenCalledWith(mockBlockedPeriods)
		expect(extractUniqueReasons).toHaveBeenCalledWith(mockBlockedPeriods)
	})

	it('should handle case with no blocked periods', () => {
		// Mock data
		const mockIssue = {} as JiraIssue
		const mockComments = {} as IssueCommentResponse

		// Set up mock return values for empty case
		jest.mocked(identifyBlockedPeriods).mockReturnValue([])
		jest.mocked(calculateTotalBlockedDays).mockReturnValue(0)
		jest.mocked(extractUniqueReasons).mockReturnValue([])

		// Execute the function
		const result = assessBlockedTime(mockIssue, mockComments)

		// Verify result
		expect(result).toEqual({
			totalDays: 0,
			reasons: [],
		})
	})
})
