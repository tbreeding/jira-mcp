import { analyzeTechnicalComplexity } from '../analyzeTechnicalComplexity'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

describe('analyzeTechnicalComplexity', function () {
	let mockIssue: Partial<JiraIssue>
	let mockComments: Partial<IssueCommentResponse>

	beforeEach(function () {
		// Use type assertion to avoid type errors
		mockIssue = {
			fields: {
				description: '',
			},
		} as unknown as JiraIssue

		mockComments = {
			comments: [],
		} as unknown as IssueCommentResponse
	})

	it('should return 0 score and null factor when no complexity indicators are found', function () {
		// Use type assertion to avoid modifying the original mock
		const issueWithDesc = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				description: 'This is a basic issue without any technical terms',
			},
		}

		const result = analyzeTechnicalComplexity(issueWithDesc as JiraIssue, mockComments as IssueCommentResponse)

		// There are no complexity indicators in this description
		// Check the actual implementation output rather than assuming
		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})

	it('should detect complexity keywords in description', function () {
		const issueWithDesc = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				description: 'This task involves refactoring the authentication system and improving performance',
			},
		}

		const result = analyzeTechnicalComplexity(issueWithDesc as JiraIssue, mockComments as IssueCommentResponse)

		// We expect a score of 1 because we have 2 keywords, which is > 0 but <= 2
		expect(result.score).toBe(1)
		expect(result.factor).toContain('refactor')
		expect(result.factor).toContain('performance')
	})

	it('should detect complexity keywords in comments', function () {
		const commentsWithContent = {
			...mockComments,
			comments: [
				{
					id: '1',
					body: {
						content: [
							{
								content: [
									{
										text: 'This will be complicated due to concurrency issues',
										type: 'text',
									},
								],
								type: 'paragraph',
							},
						],
						type: 'doc',
						version: 1,
					},
					created: new Date(),
					updated: new Date(),
					self: '',
					jsdPublic: false,
				},
			],
		}

		const result = analyzeTechnicalComplexity(mockIssue as JiraIssue, commentsWithContent as IssueCommentResponse)

		// We expect a score of 1 because we have 2 keywords ("complicated" and "concurrency"), which is > 0 but <= 2
		expect(result.score).toBe(1)
		expect(result.factor).toContain('complicated')
		expect(result.factor).toContain('concurrency')
	})

	it('should assign score 3 for more than 5 complexity indicators', function () {
		const issueWithDesc = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				description: 'This task involves architecture changes, performance optimization, and security concerns',
			},
		}

		const commentsWithContent = {
			...mockComments,
			comments: [
				{
					id: '1',
					body: {
						content: [
							{
								content: [
									{
										text: 'We also need to handle concurrency and possible memory leaks',
										type: 'text',
									},
								],
								type: 'paragraph',
							},
						],
						type: 'doc',
						version: 1,
					},
					created: new Date(),
					updated: new Date(),
					self: '',
					jsdPublic: false,
				},
				{
					id: '2',
					body: {
						content: [
							{
								content: [
									{
										text: 'This will be complicated and may lead to race conditions',
										type: 'text',
									},
								],
								type: 'paragraph',
							},
						],
						type: 'doc',
						version: 1,
					},
					created: new Date(),
					updated: new Date(),
					self: '',
					jsdPublic: false,
				},
			],
		}

		const result = analyzeTechnicalComplexity(issueWithDesc as JiraIssue, commentsWithContent as IssueCommentResponse)

		expect(result.score).toBe(3)
		// Should only display first 3 keywords with ellipsis
		expect(result.factor).toMatch(/Technical complexity indicators: .*\.\.\./)
	})

	it('should handle object type description', function () {
		// Simulating a structured description object
		const issueWithObjectDesc = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				description: {
					content: [
						{
							content: [
								{
									text: 'This task involves complex refactoring',
									type: 'text',
								},
							],
							type: 'paragraph',
						},
					],
					type: 'doc',
					version: 1,
				},
			},
		}

		const result = analyzeTechnicalComplexity(issueWithObjectDesc as JiraIssue, mockComments as IssueCommentResponse)

		// We expect a score of 1 because we have 2 keywords ("complex" and "refactor"), which is > 0
		expect(result.score).toBe(1)
		expect(result.factor).toContain('complex')
		expect(result.factor).toContain('refactor')
	})

	it('should identify complexity indicators when description mentions complex', function () {
		const issueWithDesc = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				description: 'This is a simple task with no actual technical complexity',
			},
		}

		const result = analyzeTechnicalComplexity(issueWithDesc as JiraIssue, mockComments as IssueCommentResponse)

		// The word "complex" in "complexity" is detected
		expect(result.score).toBe(1)
		expect(result.factor).toContain('complex')
	})

	it('should assign score 2 for 3-5 complexity indicators', function () {
		const issueWithDesc = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				description: 'This task requires performance optimization',
			},
		}

		const commentsWithContent = {
			...mockComments,
			comments: [
				{
					id: '1',
					body: {
						content: [
							{
								content: [
									{
										text: 'We also need to handle concurrency and security concerns',
										type: 'text',
									},
								],
								type: 'paragraph',
							},
						],
						type: 'doc',
						version: 1,
					},
					created: new Date(),
					updated: new Date(),
					self: '',
					jsdPublic: false,
				},
			],
		}

		const result = analyzeTechnicalComplexity(issueWithDesc as JiraIssue, commentsWithContent as IssueCommentResponse)

		// We expect a score of 2 because we have 3 keywords (performance, concurrency, security)
		expect(result.score).toBe(2)
		expect(result.factor).toContain('Technical complexity indicators:')
	})

	it('should handle null description gracefully', function () {
		const issueWithNullDesc = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				description: null,
			},
		}

		const result = analyzeTechnicalComplexity(issueWithNullDesc as JiraIssue, mockComments as IssueCommentResponse)

		// No keywords should be found in a null description
		expect(result.score).toBe(0)
		expect(result.factor).toBeNull()
	})
})
