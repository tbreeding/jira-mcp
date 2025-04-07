import { checkBugDuration } from '../checkBugDuration'
import { checkIssueTypeTimeline } from '../checkIssueTypeTimeline'
import { checkTaskDuration } from '../checkTaskDuration'

jest.mock('../checkBugDuration')
jest.mock('../checkTaskDuration')

describe('checkIssueTypeTimeline', () => {
	const mockCheckBugDuration = checkBugDuration as jest.MockedFunction<typeof checkBugDuration>
	const mockCheckTaskDuration = checkTaskDuration as jest.MockedFunction<typeof checkTaskDuration>

	beforeEach(() => {
		jest.resetAllMocks()
	})

	it('should return empty array for issue types other than bug or task', () => {
		expect(checkIssueTypeTimeline('Story', 10)).toEqual([])
		expect(checkIssueTypeTimeline('Epic', 10)).toEqual([])
	})

	it('should be case-insensitive when matching issue types', () => {
		mockCheckBugDuration.mockReturnValue('Bug anomaly')
		mockCheckTaskDuration.mockReturnValue('Task anomaly')

		expect(checkIssueTypeTimeline('BUG', 10)).toEqual(['Bug anomaly'])
		expect(checkIssueTypeTimeline('TASK', 10)).toEqual(['Task anomaly'])
		expect(checkIssueTypeTimeline('bug', 10)).toEqual(['Bug anomaly'])
		expect(checkIssueTypeTimeline('task', 10)).toEqual(['Task anomaly'])
	})

	it('should call checkBugDuration for bug issue type', () => {
		mockCheckBugDuration.mockReturnValue('Bug fix taking longer than expected (7 days)')

		const result = checkIssueTypeTimeline('Bug', 7)

		expect(mockCheckBugDuration).toHaveBeenCalledWith(7)
		expect(result).toEqual(['Bug fix taking longer than expected (7 days)'])
	})

	it('should not add bug anomaly when checkBugDuration returns null', () => {
		mockCheckBugDuration.mockReturnValue(null)

		const result = checkIssueTypeTimeline('Bug', 3)

		expect(mockCheckBugDuration).toHaveBeenCalledWith(3)
		expect(result).toEqual([])
	})

	it('should call checkTaskDuration for task issue type', () => {
		mockCheckTaskDuration.mockReturnValue('Task taking longer than expected (5 days)')

		const result = checkIssueTypeTimeline('Task', 5)

		expect(mockCheckTaskDuration).toHaveBeenCalledWith(5)
		expect(result).toEqual(['Task taking longer than expected (5 days)'])
	})

	it('should not add task anomaly when checkTaskDuration returns null', () => {
		mockCheckTaskDuration.mockReturnValue(null)

		const result = checkIssueTypeTimeline('Task', 2)

		expect(mockCheckTaskDuration).toHaveBeenCalledWith(2)
		expect(result).toEqual([])
	})
})
