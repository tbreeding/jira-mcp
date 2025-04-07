/**
 * Tests for comment text extraction utility
 *
 * This file contains tests for the utility function that extracts text content
 * from Jira comments in different formats (string and ADF).
 */

import { extractCommentsText } from '../commentTextExtraction'
import type { IssueCommentResponse, IssueComment } from '../../../../../types/comment'

describe('extractCommentsText', () => {
	test('handles empty comments array', () => {
		const response: IssueCommentResponse = {
			comments: [],
			maxResults: 0,
			startAt: 0,
			total: 0,
		}

		expect(extractCommentsText(response)).toBe('')
	})

	test('handles comments with string bodies', () => {
		const response: IssueCommentResponse = {
			comments: [
				{ body: 'First comment' } as unknown as IssueComment,
				{ body: 'Second comment' } as unknown as IssueComment,
			],
			maxResults: 2,
			startAt: 0,
			total: 2,
		}

		expect(extractCommentsText(response)).toBe('First comment Second comment')
	})

	test('handles comments with ADF object bodies', () => {
		const response: IssueCommentResponse = {
			comments: [
				{
					body: {
						content: [
							{
								content: [
									{ text: 'First', type: 'text' },
									{ text: 'paragraph', type: 'text' },
								],
								type: 'paragraph',
							},
						],
						type: 'doc',
						version: 1,
					},
				} as unknown as IssueComment,
				{
					body: {
						content: [
							{
								content: [
									{ text: 'Second', type: 'text' },
									{ text: 'paragraph', type: 'text' },
								],
								type: 'paragraph',
							},
						],
						type: 'doc',
						version: 1,
					},
				} as unknown as IssueComment,
			],
			maxResults: 2,
			startAt: 0,
			total: 2,
		}

		expect(extractCommentsText(response)).toBe('First paragraph Second paragraph')
	})

	test('handles comments with mixed body types', () => {
		const response: IssueCommentResponse = {
			comments: [
				{ body: 'String comment' } as unknown as IssueComment,
				{
					body: {
						content: [
							{
								content: [
									{ text: 'ADF', type: 'text' },
									{ text: 'comment', type: 'text' },
								],
								type: 'paragraph',
							},
						],
						type: 'doc',
						version: 1,
					},
				} as unknown as IssueComment,
			],
			maxResults: 2,
			startAt: 0,
			total: 2,
		}

		expect(extractCommentsText(response)).toBe('String comment ADF comment')
	})

	test('handles comments with null body', () => {
		const response: IssueCommentResponse = {
			comments: [{ body: null } as unknown as IssueComment],
			maxResults: 1,
			startAt: 0,
			total: 1,
		}

		expect(extractCommentsText(response)).toBe('')
	})

	test('handles comments with undefined body', () => {
		const response: IssueCommentResponse = {
			comments: [{ body: undefined } as unknown as IssueComment],
			maxResults: 1,
			startAt: 0,
			total: 1,
		}

		expect(extractCommentsText(response)).toBe('')
	})

	test('handles comments with incomplete ADF structure', () => {
		const response: IssueCommentResponse = {
			comments: [
				{
					body: {
						// Missing content property
						type: 'doc',
						version: 1,
					} as unknown as IssueComment['body'],
				} as unknown as IssueComment,
				{
					body: {
						content: [
							{
								// Missing content array
								type: 'paragraph',
							} as unknown as { content: { text: string; type: string }[]; type: string },
						],
						type: 'doc',
						version: 1,
					},
				} as unknown as IssueComment,
				{
					body: {
						content: [
							{
								content: [
									// Missing text property
									{ type: 'text' } as unknown as { text: string; type: string },
								],
								type: 'paragraph',
							},
						],
						type: 'doc',
						version: 1,
					},
				} as unknown as IssueComment,
			],
			maxResults: 3,
			startAt: 0,
			total: 3,
		}

		expect(extractCommentsText(response)).toBe('  ')
	})
})
