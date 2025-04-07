import * as commentAdaptationModule from '../commentAdaptation'
import * as commentProcessingModule from '../commentProcessing'
import { identifyQuestionResponsePairs } from '../questionResponsePairs'
import type { IssueCommentResponse } from '../../../../../types/comment'

// Mock dependencies
jest.mock('../commentAdaptation')
jest.mock('../commentProcessing')

describe('identifyQuestionResponsePairs', () => {
	const mockedAdaptIssueComment = commentAdaptationModule.adaptIssueComment as jest.Mock
	const mockedProcessComments = commentProcessingModule.processComments as jest.Mock

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return empty array when commentsResponse is null or undefined', () => {
		// Execute
		const result = identifyQuestionResponsePairs(undefined as unknown as IssueCommentResponse)

		// Verify
		expect(result).toEqual([])
		expect(mockedAdaptIssueComment).not.toHaveBeenCalled()
		expect(mockedProcessComments).not.toHaveBeenCalled()
	})

	it('should return empty array when comments array is empty', () => {
		// Setup
		const commentsResponse = {
			comments: [],
		} as unknown as IssueCommentResponse

		// Execute
		const result = identifyQuestionResponsePairs(commentsResponse)

		// Verify
		expect(result).toEqual([])
		expect(mockedAdaptIssueComment).not.toHaveBeenCalled()
		expect(mockedProcessComments).not.toHaveBeenCalled()
	})

	it('should return empty array when comments array has only one comment', () => {
		// Setup
		const commentsResponse = {
			comments: [{ id: '1', body: 'test' }],
		} as unknown as IssueCommentResponse

		// Execute
		const result = identifyQuestionResponsePairs(commentsResponse)

		// Verify
		expect(result).toEqual([])
		expect(mockedAdaptIssueComment).not.toHaveBeenCalled()
		expect(mockedProcessComments).not.toHaveBeenCalled()
	})

	it('should process comments when there are at least 2 comments', () => {
		// Setup
		const mockComment1 = { id: '1', body: 'test1' }
		const mockComment2 = { id: '2', body: 'test2' }
		const commentsResponse = {
			comments: [mockComment1, mockComment2],
		} as unknown as IssueCommentResponse

		const adaptedComment1 = { id: '1', body: 'test1', created: '2023-01-01T10:00:00Z' }
		const adaptedComment2 = { id: '2', body: 'test2', created: '2023-01-02T10:00:00Z' }

		mockedAdaptIssueComment.mockReturnValueOnce(adaptedComment1 as any).mockReturnValueOnce(adaptedComment2 as any)

		const expectedPairs = [{ id: 'pair1' }]
		mockedProcessComments.mockReturnValue(expectedPairs as any)

		// Execute
		const result = identifyQuestionResponsePairs(commentsResponse)

		// Verify
		expect(result).toEqual(expectedPairs)
		expect(mockedAdaptIssueComment).toHaveBeenCalledTimes(2)
		// Just verify call count, not the exact parameters since the mock implementation may add additional args
		expect(mockedProcessComments).toHaveBeenCalledWith([adaptedComment1, adaptedComment2])
	})

	it('should sort comments by creation date', () => {
		// Setup
		const laterComment = { id: '1', body: 'test1' }
		const earlierComment = { id: '2', body: 'test2' }
		const commentsResponse = {
			comments: [laterComment, earlierComment],
		} as unknown as IssueCommentResponse

		// Reverse chronological order to test sorting
		const adaptedLaterComment = { id: '1', body: 'test1', created: '2023-01-02T10:00:00Z' }
		const adaptedEarlierComment = { id: '2', body: 'test2', created: '2023-01-01T10:00:00Z' }

		mockedAdaptIssueComment
			.mockReturnValueOnce(adaptedLaterComment as any)
			.mockReturnValueOnce(adaptedEarlierComment as any)

		mockedProcessComments.mockReturnValue([])

		// Execute
		identifyQuestionResponsePairs(commentsResponse)

		// Verify
		// Comments should be passed to processComments in chronological order
		expect(mockedProcessComments).toHaveBeenCalledWith([adaptedEarlierComment, adaptedLaterComment])
	})
})
