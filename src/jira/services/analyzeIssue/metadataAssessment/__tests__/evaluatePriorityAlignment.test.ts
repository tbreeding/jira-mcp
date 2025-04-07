import { evaluatePriorityAlignment } from '../evaluatePriorityAlignment'
import { extractAllText } from '../extractAllText'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

// Mock the dependency
jest.mock('../extractAllText', () => ({
	extractAllText: jest.fn(),
}))

describe('evaluatePriorityAlignment', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return true when high priority issue contains high priority language', () => {
		// Mock the extractAllText implementation
		;(extractAllText as jest.Mock).mockReturnValue('This is an urgent issue that needs immediate attention')

		// Mock a high priority issue
		const mockIssue = {
			fields: {
				priority: {
					name: 'High',
				},
			},
		} as unknown as JiraIssue

		const mockComments = {} as IssueCommentResponse

		// Call the function
		const result = evaluatePriorityAlignment(mockIssue, mockComments)

		// Verify the mock was called
		expect(extractAllText).toHaveBeenCalledWith(mockIssue, mockComments)

		// Verify the result
		expect(result).toBe(true)
	})

	it('should return true when low priority issue contains low priority language', () => {
		// Mock the extractAllText implementation
		;(extractAllText as jest.Mock).mockReturnValue('This is a minor issue that can wait until next sprint')

		// Mock a low priority issue
		const mockIssue = {
			fields: {
				priority: {
					name: 'Low',
				},
			},
		} as unknown as JiraIssue

		const mockComments = {} as IssueCommentResponse

		// Call the function
		const result = evaluatePriorityAlignment(mockIssue, mockComments)

		// Verify the result
		expect(result).toBe(true)
	})

	it('should return false when high priority issue contains low priority language', () => {
		// Mock the extractAllText implementation
		;(extractAllText as jest.Mock).mockReturnValue('This is a minor issue that can wait until next sprint')

		// Mock a high priority issue
		const mockIssue = {
			fields: {
				priority: {
					name: 'High',
				},
			},
		} as unknown as JiraIssue

		const mockComments = {} as IssueCommentResponse

		// Call the function
		const result = evaluatePriorityAlignment(mockIssue, mockComments)

		// Verify the result
		expect(result).toBe(false)
	})

	it('should return false when low priority issue contains high priority language', () => {
		// Mock the extractAllText implementation
		;(extractAllText as jest.Mock).mockReturnValue('This is an urgent issue affecting production')

		// Mock a low priority issue
		const mockIssue = {
			fields: {
				priority: {
					name: 'Low',
				},
			},
		} as unknown as JiraIssue

		const mockComments = {} as IssueCommentResponse

		// Call the function
		const result = evaluatePriorityAlignment(mockIssue, mockComments)

		// Verify the result
		expect(result).toBe(false)
	})

	it('should return true when medium priority issue contains mixed priority language', () => {
		// Mock the extractAllText implementation with both high and low indicators
		;(extractAllText as jest.Mock).mockReturnValue('This issue is important but can wait until the next sprint')

		// Mock a medium priority issue
		const mockIssue = {
			fields: {
				priority: {
					name: 'Medium',
				},
			},
		} as unknown as JiraIssue

		const mockComments = {} as IssueCommentResponse

		// Call the function
		const result = evaluatePriorityAlignment(mockIssue, mockComments)

		// Verify the result
		expect(result).toBe(true)
	})

	it('should return true when issue contains no priority language', () => {
		// Mock the extractAllText implementation with no priority indicators
		;(extractAllText as jest.Mock).mockReturnValue('This is a standard issue without any priority indicators')

		// Try with different priority levels
		const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest']

		priorities.forEach((priorityName) => {
			const mockIssue = {
				fields: {
					priority: {
						name: priorityName,
					},
				},
			} as unknown as JiraIssue

			const mockComments = {} as IssueCommentResponse

			// Call the function
			const result = evaluatePriorityAlignment(mockIssue, mockComments)

			// Verify the result
			expect(result).toBe(true)
		})
	})
})
