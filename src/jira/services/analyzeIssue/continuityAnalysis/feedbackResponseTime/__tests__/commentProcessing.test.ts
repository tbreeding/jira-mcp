import { processComments } from '../commentProcessing'
import * as questionProcessingModule from '../questionProcessing'
import type { QuestionResponsePair } from '../../../continuityAnalysis/types/continuityAnalysis.types'
import type { JiraComment } from '../types'

// Mock dependencies
jest.mock('../questionProcessing')

describe('processComments', () => {
	// Mock dependencies
	const mockProcessQuestionComment = questionProcessingModule.processQuestionComment as jest.Mock

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return empty array when no comments are provided', () => {
		// Execute
		const result = processComments([])

		// Verify
		expect(result).toEqual([])
		expect(mockProcessQuestionComment).not.toHaveBeenCalled()
	})

	it('should skip comments with no body', () => {
		// Setup
		const comments: JiraComment[] = [
			{
				created: '2023-01-01T12:00:00Z',
				body: undefined,
				author: { displayName: 'User1' },
			},
		]

		// Execute
		const result = processComments(comments)

		// Verify
		expect(result).toEqual([])
		expect(mockProcessQuestionComment).not.toHaveBeenCalled()
	})

	it('should skip comments with no author displayName', () => {
		// Setup
		const comments: JiraComment[] = [
			{
				created: '2023-01-01T12:00:00Z',
				body: { content: 'test' },
				author: { displayName: undefined },
			},
		] as unknown as JiraComment[]

		// Execute
		const result = processComments(comments)

		// Verify
		expect(result).toEqual([])
		expect(mockProcessQuestionComment).not.toHaveBeenCalled()
	})

	it('should skip comments with body but no author object', () => {
		// Setup
		const comments: JiraComment[] = [
			{
				created: '2023-01-01T12:00:00Z',
				body: { content: 'test' },
				author: undefined,
			},
		] as unknown as JiraComment[]

		// Execute
		const result = processComments(comments)

		// Verify
		expect(result).toEqual([])
		expect(mockProcessQuestionComment).not.toHaveBeenCalled()
	})

	it('should process comments and collect question pairs', () => {
		// Setup
		const comments: JiraComment[] = [
			{
				created: '2023-01-01T12:00:00Z',
				body: { content: 'question 1?' },
				author: { displayName: 'User1' },
			},
			{
				created: '2023-01-01T13:00:00Z',
				body: { content: 'response 1' },
				author: { displayName: 'User2' },
			},
			{
				created: '2023-01-01T14:00:00Z',
				body: { content: 'question 2?' },
				author: { displayName: 'User2' },
			},
		] as unknown as JiraComment[]

		const questionPair1: QuestionResponsePair = {
			questionTimestamp: '2023-01-01T12:00:00Z',
			responseTimestamp: '2023-01-01T13:00:00Z',
			responseTimeHours: 1,
		}

		const questionPair2: QuestionResponsePair = {
			questionTimestamp: '2023-01-01T14:00:00Z',
			responseTimestamp: '2023-01-01T15:00:00Z',
			responseTimeHours: 1,
		}

		mockProcessQuestionComment
			.mockReturnValueOnce(questionPair1)
			.mockReturnValueOnce(null)
			.mockReturnValueOnce(questionPair2)

		// Execute
		const result = processComments(comments)

		// Verify
		expect(result).toEqual([questionPair1, questionPair2])
		expect(mockProcessQuestionComment).toHaveBeenCalledTimes(3)
		expect(mockProcessQuestionComment).toHaveBeenNthCalledWith(1, comments[0], [comments[1], comments[2]])
		expect(mockProcessQuestionComment).toHaveBeenNthCalledWith(2, comments[1], [comments[2]])
		expect(mockProcessQuestionComment).toHaveBeenNthCalledWith(3, comments[2], [])
	})

	it('should track author indexes correctly', () => {
		// Setup
		const comments: JiraComment[] = [
			{
				created: '2023-01-01T12:00:00Z',
				body: { content: 'comment 1' },
				author: { displayName: 'User1' },
			},
			{
				created: '2023-01-01T13:00:00Z',
				body: { content: 'comment 2' },
				author: { displayName: 'User1' },
			},
		] as unknown as JiraComment[]

		// No pairs found
		mockProcessQuestionComment.mockReturnValue(null)

		// Execute
		processComments(comments)

		// Verify
		// We're just testing that the authorLastComment record is updated correctly
		// This is indirectly verified by ensuring processQuestionComment is called with the right parameters
		expect(mockProcessQuestionComment).toHaveBeenCalledTimes(2)
		expect(mockProcessQuestionComment).toHaveBeenNthCalledWith(1, comments[0], [comments[1]])
		expect(mockProcessQuestionComment).toHaveBeenNthCalledWith(2, comments[1], [])
	})
})
