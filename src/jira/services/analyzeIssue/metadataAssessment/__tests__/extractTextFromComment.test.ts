import { extractTextFromComment } from '../extractTextFromComment'
import type { IssueComment } from '../../../../types/comment'

describe('extractTextFromComment', () => {
	it('should extract text from a comment with content', () => {
		const mockComment = {
			id: '123',
			body: {
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'This is a comment',
							},
						],
					},
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'with multiple paragraphs',
							},
						],
					},
				],
				type: 'doc',
				version: 1,
			},
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
			self: 'https://example.com',
		} as unknown as IssueComment

		const result = extractTextFromComment(mockComment)
		expect(result).toBe('This is a comment with multiple paragraphs')
	})

	it('should extract text from nested content structures', () => {
		const mockComment = {
			id: '123',
			body: {
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Outer text ',
							},
							{
								type: 'inlineCard',
								content: [
									{
										type: 'text',
										text: 'inner text',
									},
								],
							},
						],
					},
				],
				type: 'doc',
				version: 1,
			},
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
			self: 'https://example.com',
		} as unknown as IssueComment

		const result = extractTextFromComment(mockComment)
		expect(result).toBe('Outer text  inner text')
	})

	it('should handle null content in nested structure', () => {
		const mockComment = {
			id: '123',
			body: {
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Text with ',
							},
							{
								type: 'inlineCard',
								content: undefined,
							},
						],
					},
				],
				type: 'doc',
				version: 1,
			},
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
			self: 'https://example.com',
		} as unknown as IssueComment

		const result = extractTextFromComment(mockComment)
		expect(result).toBe('Text with  ')
	})

	it('should handle null content passed to extractText function', () => {
		const mockComment = {
			id: '123',
			body: {
				content: null,
				type: 'doc',
				version: 1,
			},
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
			self: 'https://example.com',
		} as unknown as IssueComment

		const result = extractTextFromComment(mockComment)
		expect(result).toBe('')
	})

	it('should return empty string when comment has no body', () => {
		const mockComment = {
			id: '123',
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
			self: 'https://example.com',
		} as unknown as IssueComment

		const result = extractTextFromComment(mockComment)
		expect(result).toBe('')
	})

	it('should return empty string when comment has empty content', () => {
		const mockComment = {
			id: '123',
			body: {
				content: [],
				type: 'doc',
				version: 1,
			},
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
			self: 'https://example.com',
		} as unknown as IssueComment

		const result = extractTextFromComment(mockComment)
		expect(result).toBe('')
	})

	it('should handle comment with content but no text', () => {
		const mockComment = {
			id: '123',
			body: {
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'inlineCard',
							},
						],
					},
				],
				type: 'doc',
				version: 1,
			},
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
			self: 'https://example.com',
		} as unknown as IssueComment

		const result = extractTextFromComment(mockComment)
		expect(result).toBe('')
	})

	it('should handle null argument in extractText function', () => {
		// This test is designed to hit line 14 in extractTextFromComment.ts
		// where the extractText function is called with null content
		const mockComment = {
			id: '123',
			body: {
				content: [
					{
						type: 'paragraph',
						content: [
							null, // This will cause content to be null when passed to extractText
						],
					},
				],
				type: 'doc',
				version: 1,
			},
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
			self: 'https://example.com',
		} as unknown as IssueComment

		const result = extractTextFromComment(mockComment)
		expect(result).toBe('')
	})

	it('should handle undefined content without crashing', () => {
		const mockComment = {
			id: '123',
			body: {
				content: undefined,
				type: 'doc',
				version: 1,
			},
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
			self: 'https://example.com',
		} as unknown as IssueComment

		const result = extractTextFromComment(mockComment)
		expect(result).toBe('')
	})
})
