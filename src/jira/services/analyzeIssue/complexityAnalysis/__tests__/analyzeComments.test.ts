import { analyzeComments } from '../analyzeComments'
import type { IssueCommentResponse, IssueComment } from '../../../../types/comment'

describe('analyzeComments', function () {
	const createMockComment = function (bodyContent: string | object): IssueComment {
		const defaultBody = {
			content: [
				{
					content: [{ text: typeof bodyContent === 'string' ? bodyContent : 'Default text', type: 'text' }],
					type: 'paragraph',
				},
			],
			type: 'doc',
			version: 1,
		}

		return {
			id: '123',
			self: 'https://example.com/jira/comment/123',
			body: typeof bodyContent === 'object' ? (bodyContent as any) : defaultBody,
			created: new Date(),
			updated: new Date(),
			jsdPublic: true,
		}
	}

	const createMockComments = function (comments: (string | object)[]): IssueCommentResponse {
		return {
			comments: comments.map(createMockComment),
			startAt: 0,
			maxResults: comments.length,
			total: comments.length,
		}
	}

	test('should return score 0 when there are no comments', function () {
		const mockComments = createMockComments([])

		const result = analyzeComments(mockComments)

		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	test('should return score 1 when there are few short comments', function () {
		const mockComments = createMockComments(['Short comment', 'Another note'])

		const result = analyzeComments(mockComments)

		expect(result.score).toBe(1)
		expect(result.factor).toContain('Discussion volume: 2 comments')
		expect(result.factor).not.toContain('with in-depth discussion')
	})

	test('should return score 2 when there are many short comments', function () {
		const mockComments = createMockComments(Array(6).fill('Short comment'))

		const result = analyzeComments(mockComments)

		expect(result.score).toBe(2)
		expect(result.factor).toContain('Discussion volume: 6 comments')
		expect(result.factor).not.toContain('with in-depth discussion')
	})

	test('should return score 2 when there are few long comments', function () {
		const longComment = 'A'.repeat(250)

		const mockComments = createMockComments([longComment, longComment])

		const result = analyzeComments(mockComments)

		expect(result.score).toBe(2)
		expect(result.factor).toContain('Discussion volume: 2 comments')
		expect(result.factor).toContain('with in-depth discussion')
	})

	test('should return score 3 when there are many long comments', function () {
		const longComment = 'A'.repeat(250)

		const mockComments = createMockComments(Array(11).fill(longComment))

		const result = analyzeComments(mockComments)

		expect(result.score).toBe(3)
		expect(result.factor).toContain('Discussion volume: 11 comments')
		expect(result.factor).toContain('with in-depth discussion')
	})

	test('should handle object body types correctly', function () {
		const complexBody = {
			content: [
				{
					content: [
						{
							text: 'This is a structured comment with a lot of content that should be considered long',
							type: 'text',
						},
					],
					type: 'paragraph',
				},
			],
			type: 'doc',
			version: 1,
		}

		const mockComments = createMockComments([complexBody])

		const result = analyzeComments(mockComments)

		// Even with complex structure, the JSON.stringify length should be calculated
		expect(result.score).toBe(1)
		expect(result.factor).toContain('Discussion volume: 1 comments')
	})
})
