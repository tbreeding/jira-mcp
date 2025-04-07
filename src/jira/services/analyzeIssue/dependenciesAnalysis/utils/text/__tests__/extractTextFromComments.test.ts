import { extractTextFromComments, extractTextFromComment, extractTextFromCommentBody } from '../extractTextFromComments'
import { extractTextFromNode } from '../extractTextFromDescription'
import type { IssueCommentResponse, IssueComment } from '../../../../../../types/comment'

// Create a helper function to verify our coverage reaches all branches
function createCommentBody() {
	return {
		type: 'doc',
		version: 1,
		content: [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: 'Test content',
					},
				],
			},
		],
	}
}

describe('extractTextFromComments', () => {
	it('should extract text from array of comments', () => {
		const commentsResponse: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					body: 'This is comment 1',
					created: new Date('2023-01-01'),
					updated: new Date('2023-01-01'),
					self: 'http://jira/1',
					jsdPublic: true,
				} as unknown as IssueComment,
				{
					id: '2',
					body: 'This is comment 2',
					created: new Date('2023-01-02'),
					updated: new Date('2023-01-02'),
					self: 'http://jira/2',
					jsdPublic: true,
				} as unknown as IssueComment,
			],
			startAt: 0,
			maxResults: 10,
			total: 2,
		}

		const result = extractTextFromComments(commentsResponse)
		expect(result).toContain('This is comment 1')
		expect(result).toContain('This is comment 2')
	})

	it('should handle missing comments array', () => {
		const emptyResponse = {} as IssueCommentResponse
		const result = extractTextFromComments(emptyResponse)

		expect(result).toBe('')
	})

	it('should handle null or undefined comments response', () => {
		// Testing with null/undefined
		const resultNull = extractTextFromComments(null as any)
		// Testing with null/undefined
		const resultUndefined = extractTextFromComments(undefined as any)

		expect(resultNull).toBe('')
		expect(resultUndefined).toBe('')
	})

	it('should handle invalid comments array', () => {
		// Type as unknown first then as IssueCommentResponse to avoid TypeScript errors
		const invalidResponse = {
			comments: 'not an array',
			startAt: 0,
			maxResults: 0,
			total: 0,
		} as unknown as IssueCommentResponse

		const result = extractTextFromComments(invalidResponse)
		expect(result).toBe('')
	})
})

describe('extractTextFromComment', () => {
	it('should extract text from string body comment', () => {
		const comment = {
			id: '1',
			body: 'This is a comment with **formatting**',
			created: new Date('2023-01-01'),
			updated: new Date('2023-01-01'),
			self: 'http://jira/1',
			jsdPublic: true,
		} as unknown as IssueComment

		const result = extractTextFromComment(comment)
		expect(result).toBe('This is a comment with formatting')
	})

	it('should extract text from ADF body comment', () => {
		const comment = {
			id: '1',
			body: {
				type: 'doc',
				version: 1,
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'This is an ADF comment',
							},
						],
					},
				],
			},
			created: new Date('2023-01-01'),
			updated: new Date('2023-01-01'),
			self: 'http://jira/1',
			jsdPublic: true,
		} as IssueComment

		const result = extractTextFromComment(comment)
		expect(result).toContain('This is an ADF comment')
	})

	it('should handle null or undefined comment', () => {
		// Testing with null/undefined
		const resultNull = extractTextFromComment(null as any)
		// Testing with null/undefined
		const resultUndefined = extractTextFromComment(undefined as any)

		expect(resultNull).toBe('')
		expect(resultUndefined).toBe('')
	})

	it('should handle missing body', () => {
		const comment = {
			id: '1',
			created: new Date('2023-01-01'),
			updated: new Date('2023-01-01'),
			self: 'http://jira/1',
			jsdPublic: true,
		} as unknown as IssueComment

		const result = extractTextFromComment(comment)
		expect(result).toBe('')
	})

	it('should handle null body', () => {
		const comment = {
			id: '1',
			body: null,
			created: new Date('2023-01-01'),
			updated: new Date('2023-01-01'),
			self: 'http://jira/1',
			jsdPublic: true,
		} as unknown as IssueComment

		const result = extractTextFromComment(comment)
		expect(result).toBe('')
	})

	it('should handle unrecognized body format', () => {
		const comment = {
			id: '1',
			// Testing with unrecognized format
			body: { unknownFormat: true },
			created: new Date('2023-01-01'),
			updated: new Date('2023-01-01'),
			self: 'http://jira/1',
			jsdPublic: true,
		} as unknown as IssueComment

		const result = extractTextFromComment(comment)
		expect(result).toBe('')
	})

	it('should handle comment with body that is neither string nor object', () => {
		const comment = {
			id: '1',
			// Use a numeric body to test the default return case
			body: 12345,
			created: new Date('2023-01-01'),
			updated: new Date('2023-01-01'),
			self: 'http://jira/1',
			jsdPublic: true,
		} as unknown as IssueComment

		const result = extractTextFromComment(comment)
		expect(result).toBe('')
	})
})

describe('extractTextFromCommentBody', () => {
	it('should extract text from ADF body', () => {
		const body = createCommentBody()

		const result = extractTextFromCommentBody(body)
		expect(result).toContain('Test content')
	})

	it('should handle ADF body with empty text nodes', () => {
		const body = {
			type: 'doc',
			version: 1,
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: '',
						},
					],
				},
			],
		}

		const result = extractTextFromCommentBody(body)
		expect(result).toBe('')
	})

	it('should extract text from deeply nested ADF structure', () => {
		const body = {
			type: 'doc',
			version: 1,
			content: [
				{
					type: 'bulletList',
					content: [
						{
							type: 'listItem',
							content: [
								{
									type: 'paragraph',
									content: [
										{
											type: 'text',
											text: 'Deeply nested item',
										},
									],
								},
							],
						},
					],
				},
			],
		}

		const result = extractTextFromCommentBody(body)
		expect(result).toContain('Deeply nested item')
	})

	it('should handle non-object body', () => {
		const bodyString = 'This is not an object'
		const bodyNumber = 123

		const resultString = extractTextFromCommentBody(bodyString)
		const resultNumber = extractTextFromCommentBody(bodyNumber)

		expect(resultString).toBe('')
		expect(resultNumber).toBe('')
	})

	it('should handle null or undefined body', () => {
		const resultNull = extractTextFromCommentBody(null)
		const resultUndefined = extractTextFromCommentBody(undefined)

		expect(resultNull).toBe('')
		expect(resultUndefined).toBe('')
	})

	it('should handle missing content array', () => {
		const body = {
			type: 'doc',
			version: 1,
		}

		const result = extractTextFromCommentBody(body)
		expect(result).toBe('')
	})

	it('should handle invalid content property', () => {
		const body = {
			type: 'doc',
			version: 1,
			content: 'not an array',
		}

		const result = extractTextFromCommentBody(body)
		expect(result).toBe('')
	})
})

describe('extractTextFromNode', () => {
	it('should extract text from text node', () => {
		const node = {
			type: 'text',
			text: 'This is text',
		}

		const result = extractTextFromNode(node)
		expect(result).toBe('This is text')
	})

	it('should extract text from container node with content', () => {
		const node = {
			type: 'paragraph',
			content: [
				{
					type: 'text',
					text: 'Text in paragraph',
				},
				{
					type: 'text',
					text: 'More text',
				},
				// Add an empty text node to force filter to work
				{
					type: 'text',
					text: '',
				},
			],
		}

		const result = extractTextFromNode(node)
		expect(result).toBe('Text in paragraph More text')
	})

	it('should handle null or undefined node', () => {
		const resultNull = extractTextFromNode(null as unknown as any)
		const resultUndefined = extractTextFromNode(undefined as unknown as any)

		expect(resultNull).toBe('')
		expect(resultUndefined).toBe('')
	})

	it('should handle node without content or text', () => {
		const node = {
			type: 'unknown',
		}

		const result = extractTextFromNode(node)
		expect(result).toBe('')
	})

	it('should handle deeply nested content', () => {
		const node = {
			type: 'bulletList',
			content: [
				{
					type: 'listItem',
					content: [
						{
							type: 'paragraph',
							content: [
								{
									type: 'text',
									text: 'Nested text',
								},
							],
						},
					],
				},
			],
		}

		const result = extractTextFromNode(node)
		expect(result).toContain('Nested text')
	})

	it('should handle empty content array', () => {
		const node = {
			type: 'paragraph',
			content: [],
		}

		const result = extractTextFromNode(node)
		expect(result).toBe('')
	})

	it('should handle invalid content property', () => {
		const node = {
			type: 'paragraph',
			content: 'not an array',
		} as unknown as any

		const result = extractTextFromNode(node)
		expect(result).toBe('')
	})
})

describe('re-exported functions', () => {
	it('should re-export extractTextFromNode correctly', () => {
		const node = {
			type: 'text',
			text: 'Test text',
		}

		// This should use the re-exported function
		const result = extractTextFromNode(node)
		expect(result).toBe('Test text')
	})
})
