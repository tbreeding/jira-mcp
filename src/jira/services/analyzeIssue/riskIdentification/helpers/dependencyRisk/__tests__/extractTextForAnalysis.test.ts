/**
 * Tests for the extractTextForAnalysis function
 */

import { extractTextForAnalysis } from '../extractTextForAnalysis'
import type { IssueCommentResponse } from '../../../../../../types/comment'
import type { JiraIssue } from '../../../../../../types/issue.types'

describe('extractTextForAnalysis', () => {
	it('should extract text from issue description and comments', () => {
		// Prepare test data
		const mockIssue = {
			fields: {
				description: 'This is a test description',
			},
		} as unknown as JiraIssue

		const mockComments = {
			comments: [{ body: 'First comment' }, { body: 'Second comment' }],
		} as unknown as IssueCommentResponse

		// Call the function
		const result = extractTextForAnalysis(mockIssue, mockComments)

		// Assert the result
		expect(result).toBe('This is a test description First comment Second comment')
	})

	it('should handle empty description and comments', () => {
		// Prepare test data
		const mockIssue = {
			fields: {
				description: '',
			},
		} as unknown as JiraIssue

		const mockComments = {
			comments: [{ body: '' }, { body: null }],
		} as unknown as IssueCommentResponse

		// Call the function
		const result = extractTextForAnalysis(mockIssue, mockComments)

		// Assert the result
		expect(result).toBe('  ')
	})

	it('should handle undefined description', () => {
		// Prepare test data
		const mockIssue = {
			fields: {},
		} as unknown as JiraIssue

		const mockComments = {
			comments: [{ body: 'Comment text' }],
		} as unknown as IssueCommentResponse

		// Call the function
		const result = extractTextForAnalysis(mockIssue, mockComments)

		// Assert the result
		expect(result).toBe(' Comment text')
	})
})
