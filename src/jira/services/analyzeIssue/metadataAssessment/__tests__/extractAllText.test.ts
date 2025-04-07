import type { IssueCommentResponse, IssueComment } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

// Mock dependencies before importing
jest.mock('../extractTextFromDescription', () => ({
	extractTextFromDescription: jest.fn(),
}))

jest.mock('../extractTextFromComment', () => ({
	extractTextFromComment: jest.fn(),
}))

// Import the tested function and mocked modules
import { extractAllText } from '../extractAllText'
import { extractTextFromDescription } from '../extractTextFromDescription'
import { extractTextFromComment } from '../extractTextFromComment'

// Get the mock functions
const mockExtractTextFromDescription = extractTextFromDescription as jest.Mock
const mockExtractTextFromComment = extractTextFromComment as jest.Mock

describe('extractAllText', () => {
	beforeEach(() => {
		// Reset mock function calls before each test
		jest.clearAllMocks()
	})

	it('should combine summary, description, and comments text', () => {
		// Mock implementation for the imported functions
		mockExtractTextFromDescription.mockReturnValue('Description text')
		mockExtractTextFromComment.mockImplementation((comment: IssueComment) => `Comment ${comment.id}`)

		// Mock issue and comments
		const mockIssue = {
			fields: {
				summary: 'Issue summary',
				description: 'Some description',
			},
		} as unknown as JiraIssue

		const mockCommentsResponse = {
			comments: [
				{ id: '1', body: { content: [] } },
				{ id: '2', body: { content: [] } },
			],
		} as unknown as IssueCommentResponse

		// Call the function
		const result = extractAllText(mockIssue, mockCommentsResponse)

		// Assertions
		expect(mockExtractTextFromDescription).toHaveBeenCalledWith('Some description')
		expect(mockExtractTextFromComment).toHaveBeenCalledTimes(2)
		expect(mockExtractTextFromComment).toHaveBeenCalledWith(mockCommentsResponse.comments[0])
		expect(mockExtractTextFromComment).toHaveBeenCalledWith(mockCommentsResponse.comments[1])
		expect(result).toBe('Issue summary Description text Comment 1 Comment 2')
	})

	it('should handle empty comments array', () => {
		// Mock implementation
		mockExtractTextFromDescription.mockReturnValue('Description text')

		// Mock issue and empty comments
		const mockIssue = {
			fields: {
				summary: 'Issue summary',
				description: 'Some description',
			},
		} as unknown as JiraIssue

		const mockCommentsResponse = {
			comments: [],
		} as unknown as IssueCommentResponse

		// Call the function
		const result = extractAllText(mockIssue, mockCommentsResponse)

		// Assertions
		expect(mockExtractTextFromComment).not.toHaveBeenCalled()
		expect(result).toBe('Issue summary Description text ')
	})

	it('should handle null description', () => {
		// Mock implementation
		mockExtractTextFromDescription.mockReturnValue('')
		mockExtractTextFromComment.mockReturnValue('Comment text')

		// Mock issue with null description
		const mockIssue = {
			fields: {
				summary: 'Issue summary',
				description: null,
			},
		} as unknown as JiraIssue

		const mockCommentsResponse = {
			comments: [{ id: '1', body: { content: [] } }],
		} as unknown as IssueCommentResponse

		// Call the function
		const result = extractAllText(mockIssue, mockCommentsResponse)

		// Assertions
		expect(mockExtractTextFromDescription).toHaveBeenCalledWith(null)
		expect(result).toBe('Issue summary  Comment text')
	})
})
