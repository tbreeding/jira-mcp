import * as extractAllTextModule from '../../metadataAssessment/extractAllText'
import { extractRelevantText } from '../extractRelevantText'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

jest.mock('../../metadataAssessment/extractAllText')

describe('extractRelevantText', () => {
	// Reset mocks before each test
	beforeEach(() => {
		jest.resetAllMocks()
		jest.spyOn(extractAllTextModule, 'extractAllText').mockReturnValue('Base extracted text')
	})

	it('should extract basic text with extractAllText', () => {
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const mockCommentsResponse = {
			comments: [],
			startAt: 0,
			maxResults: 0,
			total: 0,
		} as unknown as IssueCommentResponse

		const result = extractRelevantText(mockIssue, mockCommentsResponse)

		// Should call extractAllText with the issue and comments
		expect(extractAllTextModule.extractAllText).toHaveBeenCalledWith(mockIssue, mockCommentsResponse)

		// Should return the base text from extractAllText
		expect(result).toBe('Base extracted text')
	})

	it('should include custom fields if present', () => {
		const mockIssue = {
			fields: {
				customfield_10101: 'Sample acceptance criteria',
			},
		} as unknown as JiraIssue

		const mockCommentsResponse = {
			comments: [],
			startAt: 0,
			maxResults: 0,
			total: 0,
		} as unknown as IssueCommentResponse

		const result = extractRelevantText(mockIssue, mockCommentsResponse)

		// Should call extractAllText
		expect(extractAllTextModule.extractAllText).toHaveBeenCalledWith(mockIssue, mockCommentsResponse)

		// Should include both the base text and the custom field
		expect(result).toBe('Base extracted text Sample acceptance criteria')
	})

	it('should handle non-string custom fields', () => {
		const mockIssue = {
			fields: {
				customfield_10101: 12345, // A number instead of a string
			},
		} as unknown as JiraIssue

		const mockCommentsResponse = {
			comments: [],
			startAt: 0,
			maxResults: 0,
			total: 0,
		} as unknown as IssueCommentResponse

		const result = extractRelevantText(mockIssue, mockCommentsResponse)

		// Should include both the base text and the custom field converted to string
		expect(result).toBe('Base extracted text 12345')
	})
})
