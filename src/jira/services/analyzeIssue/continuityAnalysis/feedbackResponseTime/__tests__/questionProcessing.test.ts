import { processQuestionComment } from '../questionProcessing'
import * as textExtractionModule from '../textExtraction'
import * as timeCalculationModule from '../timeCalculation'
import type { JiraComment } from '../types'

// Mock dependencies
jest.mock('../textExtraction')
jest.mock('../timeCalculation')

describe('processQuestionComment', () => {
	// Mock dependencies
	const mockGetCommentText = textExtractionModule.getCommentText as jest.Mock
	const mockAdjustForBusinessHours = timeCalculationModule.adjustForBusinessHours as jest.Mock

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return null when comment has no body', () => {
		// Setup
		const comment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: undefined,
			author: { displayName: 'User1' },
		}
		const laterComments: JiraComment[] = []

		// Execute
		const result = processQuestionComment(comment, laterComments)

		// Verify
		expect(result).toBeNull()
		expect(mockGetCommentText).not.toHaveBeenCalled()
	})

	it('should return null when comment does not contain a question', () => {
		// Setup
		const comment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'This is just a statement.' },
			author: { displayName: 'User1' },
		} as unknown as JiraComment
		const laterComments: JiraComment[] = []

		mockGetCommentText.mockReturnValue('This is just a statement.')

		// Execute
		const result = processQuestionComment(comment, laterComments)

		// Verify
		expect(result).toBeNull()
		expect(mockGetCommentText).toHaveBeenCalledWith(comment.body)
	})

	it('should return null when no response from different author is found', () => {
		// Setup
		const comment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'Is this a question?' },
			author: { displayName: 'User1' },
		} as unknown as JiraComment

		const laterComments: JiraComment[] = [
			{
				created: '2023-01-01T13:00:00Z',
				body: { content: 'Another comment' },
				author: { displayName: 'User1' }, // Same author
			},
		] as unknown as JiraComment[]

		mockGetCommentText.mockReturnValue('Is this a question?')

		// Execute
		const result = processQuestionComment(comment, laterComments)

		// Verify
		expect(result).toBeNull()
		expect(mockGetCommentText).toHaveBeenCalledWith(comment.body)
	})

	it('should handle comment with missing author displayName', () => {
		// Setup
		const comment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'Is this a question?' },
			author: { displayName: undefined },
		} as unknown as JiraComment

		const laterComments: JiraComment[] = [
			{
				created: '2023-01-01T13:00:00Z',
				body: { content: 'This is a response' },
				author: { displayName: 'User2' },
			},
		] as unknown as JiraComment[]

		mockGetCommentText.mockReturnValue('Is this a question?')

		// Execute
		const result = processQuestionComment(comment, laterComments)

		// Verify
		expect(result).not.toBeNull()
		expect(mockGetCommentText).toHaveBeenCalledWith(comment.body)
		// The function should use empty string as author name
		expect(mockAdjustForBusinessHours).toHaveBeenCalled()
	})

	it('should handle comment with missing author object', () => {
		// Setup
		const comment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'Is this a question?' },
			author: undefined,
		} as unknown as JiraComment
		const laterComments: JiraComment[] = [
			{
				created: '2023-01-01T13:00:00Z',
				body: { content: 'This is a response' },
				author: { displayName: 'User2' },
			},
		] as unknown as JiraComment[]

		mockGetCommentText.mockReturnValue('Is this a question?')

		// Execute
		const result = processQuestionComment(comment, laterComments)

		// Verify
		expect(result).not.toBeNull()
		expect(mockGetCommentText).toHaveBeenCalledWith(comment.body)
		// The function should use empty string as author name
		expect(mockAdjustForBusinessHours).toHaveBeenCalled()
	})

	it('should handle response comment with missing author information', () => {
		// Setup
		const comment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'Is this a question?' },
			author: { displayName: 'User1' },
		} as unknown as JiraComment
		const laterComments: JiraComment[] = [
			{
				created: '2023-01-01T13:00:00Z',
				body: { content: 'This is a response' },
				// Response comment has no author property
			} as unknown as JiraComment,
		]

		mockGetCommentText.mockReturnValue('Is this a question?')
		mockAdjustForBusinessHours.mockReturnValue(1) // 1 hour response time

		// Execute
		const result = processQuestionComment(comment, laterComments)

		// Verify
		expect(result).not.toBeNull()
		expect(mockGetCommentText).toHaveBeenCalledWith(comment.body)
		expect(mockAdjustForBusinessHours).toHaveBeenCalled()
	})

	it('should handle empty laterComments array', () => {
		// Setup
		const comment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'Is this a question?' },
			author: { displayName: 'User1' },
		} as unknown as JiraComment
		const laterComments: JiraComment[] = []

		mockGetCommentText.mockReturnValue('Is this a question?')

		// Execute
		const result = processQuestionComment(comment, laterComments)

		// Verify
		expect(result).toBeNull()
		expect(mockGetCommentText).toHaveBeenCalledWith(comment.body)
	})

	it('should handle undefined laterComments parameter', () => {
		// Setup
		const comment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'Is this a question?' },
			author: { displayName: 'User1' },
		} as unknown as JiraComment
		// Pass undefined instead of an empty array
		const laterComments = undefined

		mockGetCommentText.mockReturnValue('Is this a question?')

		// Execute
		const result = processQuestionComment(comment, laterComments as unknown as JiraComment[])

		// Verify
		expect(result).toBeNull()
		expect(mockGetCommentText).toHaveBeenCalledWith(comment.body)
	})

	it('should detect a question and response with a question mark', () => {
		// Setup
		const questionComment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'Is this a question?' },
			author: { displayName: 'User1' },
		} as unknown as JiraComment

		const responseComment: JiraComment = {
			created: '2023-01-01T14:00:00Z',
			body: { content: 'Yes it is' },
			author: { displayName: 'User2' },
		} as unknown as JiraComment

		const laterComments: JiraComment[] = [responseComment]

		mockGetCommentText.mockReturnValue('Is this a question?')
		mockAdjustForBusinessHours.mockReturnValue(2) // 2 hours response time

		// Execute
		const result = processQuestionComment(questionComment, laterComments)

		// Verify
		expect(result).toEqual({
			questionTimestamp: questionComment.created,
			responseTimestamp: responseComment.created,
			responseTimeHours: 2,
		})

		expect(mockGetCommentText).toHaveBeenCalledWith(questionComment.body)
		expect(mockAdjustForBusinessHours).toHaveBeenCalledWith(
			new Date(questionComment.created).getTime(),
			new Date(responseComment.created).getTime(),
		)
	})

	it('should detect a question with a question phrase', () => {
		// Setup
		const questionComment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'Can you please review this PR' }, // No question mark but has phrase
			author: { displayName: 'User1' },
		} as unknown as JiraComment

		const responseComment: JiraComment = {
			created: '2023-01-01T14:00:00Z',
			body: { content: 'I will look at it' },
			author: { displayName: 'User2' },
		} as unknown as JiraComment

		const laterComments: JiraComment[] = [responseComment]

		mockGetCommentText.mockReturnValue('Can you please review this PR')
		mockAdjustForBusinessHours.mockReturnValue(2) // 2 hours response time

		// Execute
		const result = processQuestionComment(questionComment, laterComments)

		// Verify
		expect(result).toEqual({
			questionTimestamp: questionComment.created,
			responseTimestamp: responseComment.created,
			responseTimeHours: 2,
		})

		expect(mockGetCommentText).toHaveBeenCalledWith(questionComment.body)
	})

	it('should find first response from different author', () => {
		// Setup
		const questionComment: JiraComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'Is this a question?' },
			author: { displayName: 'User1' },
		} as unknown as JiraComment

		const sameAuthorComment: JiraComment = {
			created: '2023-01-01T13:00:00Z',
			body: { content: 'Adding more info' },
			author: { displayName: 'User1' },
		} as unknown as JiraComment

		const responseComment: JiraComment = {
			created: '2023-01-01T14:00:00Z',
			body: { content: 'Yes it is' },
			author: { displayName: 'User2' },
		} as unknown as JiraComment

		const laterComment: JiraComment = {
			created: '2023-01-01T15:00:00Z',
			body: { content: 'Another response' },
			author: { displayName: 'User3' },
		} as unknown as JiraComment

		const laterComments: JiraComment[] = [sameAuthorComment, responseComment, laterComment]

		mockGetCommentText.mockReturnValue('Is this a question?')
		mockAdjustForBusinessHours.mockReturnValue(2) // 2 hours response time

		// Execute
		const result = processQuestionComment(questionComment, laterComments)

		// Verify
		expect(result).toEqual({
			questionTimestamp: questionComment.created,
			responseTimestamp: responseComment.created,
			responseTimeHours: 2,
		})
	})
})
