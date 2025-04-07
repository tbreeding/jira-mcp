import { getDependenciesAnalysis } from '../getDependenciesAnalysis'
import type { IssueCommentResponse, IssueComment } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

describe('getDependenciesAnalysis', () => {
	const mockIssue = {
		key: 'TEST-123',
		fields: {
			summary: 'Test issue',
			description: 'This depends on the auth service and needs approval from the security team',
			issuelinks: [
				{
					id: '1',
					type: {
						id: '10000',
						name: 'Blocks',
						inward: 'is blocked by',
						outward: 'blocks',
					},
					inwardIssue: {
						key: 'TEST-456',
						fields: {
							summary: 'Blocking issue',
						},
					},
				},
				{
					id: '2',
					type: {
						id: '10001',
						name: 'Relates',
						inward: 'relates to',
						outward: 'relates to',
					},
					outwardIssue: {
						key: 'TEST-789',
						fields: {
							summary: 'Related issue',
						},
					},
				},
			],
		},
	} as unknown as JiraIssue

	const mockComments: IssueCommentResponse = {
		comments: [
			{
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
									text: 'We should wait for TEST-999 as it contains required fixes',
								},
							],
						},
					],
				},
				created: new Date('2023-01-01'),
				updated: new Date('2023-01-01'),
				self: 'http://jira/1',
				jsdPublic: true,
			} as IssueComment,
			{
				id: '2',
				body: {
					type: 'doc',
					version: 1,
					content: [
						{
							type: 'paragraph',
							content: [
								{
									type: 'text',
									text: 'This also depends on the payment API',
								},
							],
						},
					],
				},
				created: new Date('2023-01-02'),
				updated: new Date('2023-01-02'),
				self: 'http://jira/2',
				jsdPublic: true,
			} as IssueComment,
		],
		startAt: 0,
		maxResults: 10,
		total: 2,
	}

	it('should extract blockers from issue links', () => {
		const result = getDependenciesAnalysis(mockIssue, mockComments)

		expect(result.blockers).toHaveLength(1)
		expect(result.blockers[0].key).toBe('TEST-456')
		expect(result.blockers[0].summary).toBe('Blocking issue')
	})

	it('should extract related issues from issue links', () => {
		const result = getDependenciesAnalysis(mockIssue, mockComments)

		expect(result.relatedIssues).toHaveLength(1)
		expect(result.relatedIssues[0].key).toBe('TEST-789')
		expect(result.relatedIssues[0].summary).toBe('Related issue')
	})

	it('should detect implicit dependencies from comments', () => {
		const result = getDependenciesAnalysis(mockIssue, mockComments)

		expect(result.implicitDependencies).toContain('TEST-999')
	})

	it('should identify external dependencies from description and comments', () => {
		const result = getDependenciesAnalysis(mockIssue, mockComments)

		expect(result.externalDependencies).toEqual(
			expect.arrayContaining([
				expect.stringMatching(/System: auth service/i),
				expect.stringMatching(/Team: security team/i),
				expect.stringMatching(/System: payment API/i),
			]),
		)
	})

	it('should return empty arrays when no dependencies exist', () => {
		const emptyIssue = {
			key: 'EMPTY-1',
			fields: {
				summary: 'Empty issue',
				description: 'No dependencies here',
			},
		} as unknown as JiraIssue

		const emptyComments: IssueCommentResponse = {
			comments: [],
			startAt: 0,
			maxResults: 10,
			total: 0,
		}

		const result = getDependenciesAnalysis(emptyIssue, emptyComments)

		expect(result.blockers).toHaveLength(0)
		expect(result.relatedIssues).toHaveLength(0)
		expect(result.implicitDependencies).toHaveLength(0)
		expect(result.externalDependencies).toHaveLength(0)
	})

	it('should handle null inputs gracefully', () => {
		// Test with null issue
		const resultWithNullIssue = getDependenciesAnalysis(null as unknown as JiraIssue, mockComments)
		expect(resultWithNullIssue.blockers).toHaveLength(0)
		expect(resultWithNullIssue.relatedIssues).toHaveLength(0)
		expect(resultWithNullIssue.implicitDependencies).toHaveLength(0)
		expect(resultWithNullIssue.externalDependencies).toHaveLength(0)

		// Test with null commentsResponse
		const resultWithNullComments = getDependenciesAnalysis(mockIssue, null as unknown as IssueCommentResponse)
		expect(resultWithNullComments.blockers).toHaveLength(0)
		expect(resultWithNullComments.relatedIssues).toHaveLength(0)
		expect(resultWithNullComments.implicitDependencies).toHaveLength(0)
		expect(resultWithNullComments.externalDependencies).toHaveLength(0)
	})
})
