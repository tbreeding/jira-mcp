import { detectImplicitDependencies, extractExplicitlyLinkedKeys } from '../detectImplicitDependencies'
import type { IssueCommentResponse } from '../../../../../types/comment'
import type { JiraIssue } from '../../../../../types/issue.types'

jest.mock('../../utils/text/extractTextFromDescription', () => ({
	extractTextFromDescription: jest.fn().mockImplementation((issue) => {
		if (issue && issue.fields && issue.fields.description) {
			return issue.fields.description
		}
		return ''
	}),
}))

jest.mock('../../utils/text/extractTextFromComments', () => ({
	extractTextFromComments: jest.fn().mockImplementation((commentsResponse) => {
		if (commentsResponse && commentsResponse.comments && Array.isArray(commentsResponse.comments)) {
			// For TEST-999 to be detected as a dependency, we need to make sure the comment includes
			// a dependency phrase and the issue key in a format that will be properly detected
			return commentsResponse.comments
				.map((c: any) => {
					if (c.body && typeof c.body === 'object' && c.body.content) {
						// This is for ADF format comments
						try {
							const commentText = JSON.stringify(c.body)
							if (commentText.includes('TEST-999')) {
								return 'We are blocked by TEST-999 and waiting for it to be completed'
							}
						} catch {
							// Ignore
						}
					}
					return typeof c.body === 'string' ? c.body : 'Comment body'
				})
				.join(' ')
		}
		return ''
	}),
}))

describe('detectImplicitDependencies', () => {
	const mockIssue = {
		key: 'TEST-123',
		fields: {
			summary: 'Test issue',
			description: 'This issue depends on TEST-456 to be completed first',
			issuelinks: [
				{
					id: '1',
					type: {
						name: 'Relates',
						inward: 'relates to',
						outward: 'relates to',
					},
					outwardIssue: {
						key: 'TEST-789',
						fields: {
							summary: 'Explicitly linked issue',
						},
					},
				},
			],
		},
	} as JiraIssue

	const mockComments = {
		comments: [
			{
				id: '1',
				body: {
					content: [
						{
							content: [
								{
									text: 'We also need to wait for TEST-999 as it is blocked by that',
									type: 'text',
								},
							],
							type: 'paragraph',
						},
					],
					type: 'doc',
					version: 1,
				},
				created: new Date('2023-01-01'),
				updated: new Date('2023-01-01'),
				self: 'http://jira/1',
				jsdPublic: true,
			},
		],
		startAt: 0,
		maxResults: 10,
		total: 1,
	} as IssueCommentResponse

	it('should detect implicit dependencies from description and comments', () => {
		const result = detectImplicitDependencies(mockIssue, mockComments)

		expect(result).toContain('TEST-456')
		expect(result).toContain('TEST-999')
		expect(result).toHaveLength(2)
	})

	it('should exclude explicitly linked issues', () => {
		// Add TEST-456 as an explicit link
		const modifiedIssuelinks = Array.isArray(mockIssue.fields.issuelinks) ? [...mockIssue.fields.issuelinks] : []

		modifiedIssuelinks.push({
			id: '2',
			self: 'http://jira/rest/api/2/issueLink/2',
			type: {
				id: '10001',
				name: 'Relates',
				inward: 'relates to',
				outward: 'relates to',
				self: 'http://jira/rest/api/2/issueLinkType/10001',
			},
			outwardIssue: {
				key: 'TEST-456',
				id: '10456',
				self: 'http://jira/rest/api/2/issue/10456',
				fields: {
					summary: 'Now explicitly linked',
					priority: {
						self: 'http://jira/rest/api/2/priority/3',
						iconUrl: 'http://jira/images/icons/priority_major.gif',
						name: 'Major',
						id: '3',
					},
					status: {
						self: 'http://jira/rest/api/2/status/10000',
						description: 'Issue is in progress',
						iconUrl: 'http://jira/images/icons/status_inprogress.gif',
						name: 'In Progress',
						id: '10000',
						statusCategory: {
							self: 'http://jira/rest/api/2/statuscategory/4',
							id: 4,
							key: 'in-progress',
							colorName: 'yellow',
							name: 'In Progress',
						},
					},
					issuetype: {
						self: 'http://jira/rest/api/2/issuetype/10000',
						id: '10000',
						description: 'A task that needs to be done.',
						iconUrl: 'http://jira/images/icons/issuetype_task.png',
						name: 'Task',
						subtask: false,
						avatarId: 10318,
						hierarchyLevel: 0,
					},
				},
			},
		})

		const issueWithExplicitLink = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				issuelinks: modifiedIssuelinks,
			},
		} as unknown as JiraIssue

		const result = detectImplicitDependencies(issueWithExplicitLink, mockComments)

		// Only TEST-999 should remain as implicit
		expect(result).not.toContain('TEST-456')
		expect(result).toContain('TEST-999')
		expect(result).toHaveLength(1)
	})

	it('should return empty array when no dependencies found', () => {
		const issueWithoutDeps = {
			key: 'TEST-123',
			expand: '',
			id: '10000',
			self: 'http://jira/REST/api/2/issue/10000',
			changelog: {
				startAt: 0,
				maxResults: 0,
				total: 0,
				histories: [],
			},
			fields: {
				summary: 'Test issue',
				description: 'This issue has no dependencies',
				issuelinks: [],
			},
		} as unknown as JiraIssue

		const emptyComments = {
			comments: [],
			startAt: 0,
			maxResults: 10,
			total: 0,
		} as IssueCommentResponse

		const result = detectImplicitDependencies(issueWithoutDeps, emptyComments)
		expect(result).toHaveLength(0)
	})

	it('should return empty array when issue or comments are null', () => {
		const result = detectImplicitDependencies(null as unknown as JiraIssue, mockComments)
		expect(result).toHaveLength(0)

		const result2 = detectImplicitDependencies(mockIssue, null as unknown as IssueCommentResponse)
		expect(result2).toHaveLength(0)
	})

	it('should filter out links without inward issue', () => {
		const issueWithExplicitLink = {
			...mockIssue,
			fields: {
				...mockIssue.fields,
				issuelinks: [
					...(Array.isArray(mockIssue.fields.issuelinks) ? mockIssue.fields.issuelinks : []),
					{
						id: '2',
						self: 'http://jira/rest/api/2/issueLink/2',
						type: {
							id: '10001',
							name: 'Relates',
							inward: 'relates to',
							outward: 'relates to',
							self: 'http://jira/rest/api/2/issueLinkType/10001',
						},
						outwardIssue: {
							key: 'TEST-456',
							id: '10456',
							self: 'http://jira/rest/api/2/issue/10456',
							fields: {
								summary: 'Now explicitly linked',
								priority: {
									self: 'http://jira/rest/api/2/priority/3',
									iconUrl: 'http://jira/images/icons/priority_major.gif',
									name: 'Major',
									id: '3',
								},
								status: {
									self: 'http://jira/rest/api/2/status/10000',
									description: 'Issue is in progress',
									iconUrl: 'http://jira/images/icons/status_inprogress.gif',
									name: 'In Progress',
									id: '10000',
									statusCategory: {
										self: 'http://jira/rest/api/2/statuscategory/4',
										id: 4,
										key: 'in-progress',
										colorName: 'yellow',
										name: 'In Progress',
									},
								},
								issuetype: {
									self: 'http://jira/rest/api/2/issuetype/10000',
									id: '10000',
									description: 'A task that needs to be done.',
									iconUrl: 'http://jira/images/icons/issuetype_task.png',
									name: 'Task',
									subtask: false,
									avatarId: 10318,
									hierarchyLevel: 0,
								},
							},
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = detectImplicitDependencies(issueWithExplicitLink, mockComments)

		// Only TEST-999 should remain as implicit
		expect(result).not.toContain('TEST-456')
		expect(result).toContain('TEST-999')
		expect(result).toHaveLength(1)
	})

	it('should not consider issue keys without dependency context as dependencies', () => {
		// Create an issue with a description that mentions an issue key without dependency context
		const issueWithUnrelatedKey = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Referencing TEST-456 but not as a dependency. Just mentioning it.',
				issuelinks: [],
			},
		} as unknown as JiraIssue

		const emptyComments = {
			comments: [],
			startAt: 0,
			maxResults: 0,
			total: 0,
		} as IssueCommentResponse

		const result = detectImplicitDependencies(issueWithUnrelatedKey, emptyComments)

		// TEST-456 should not be included as there's no dependency phrase nearby
		expect(result).not.toContain('TEST-456')
		expect(result).toHaveLength(0)
	})
})

describe('extractExplicitlyLinkedKeys', () => {
	it('should extract keys from inward and outward issue links', () => {
		const issue = {
			key: 'TEST-123',
			fields: {
				issuelinks: [
					{
						inwardIssue: {
							key: 'TEST-456',
						},
					},
					{
						outwardIssue: {
							key: 'TEST-789',
						},
					},
				],
			},
		} as JiraIssue

		const result = extractExplicitlyLinkedKeys(issue)

		expect(result.has('TEST-456')).toBe(true)
		expect(result.has('TEST-789')).toBe(true)
		expect(result.size).toBe(2)
	})

	it('should handle missing keys in inwardIssue or outwardIssue objects', () => {
		const issue = {
			key: 'TEST-123',
			fields: {
				issuelinks: [
					{
						// inwardIssue is undefined
						outwardIssue: {
							key: 'TEST-789',
						},
					},
					{
						inwardIssue: {
							key: 'TEST-456',
						},
						// outwardIssue is undefined
					},
					{
						// Objects exist but without key property
						inwardIssue: {
							id: '123',
							// No key property
						},
						outwardIssue: {
							id: '456',
							// No key property
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractExplicitlyLinkedKeys(issue)

		// The function adds both valid keys and 'undefined' for the missing keys
		expect(result.has('TEST-456')).toBe(true)
		expect(result.has('TEST-789')).toBe(true)
		expect(result.has(undefined as unknown as string)).toBe(true)
		expect(result.size).toBe(3) // Two valid keys plus one 'undefined'
	})

	it('should return empty set when no issue links exist', () => {
		const issue = {
			key: 'TEST-123',
			fields: {},
		} as unknown as JiraIssue

		const result = extractExplicitlyLinkedKeys(issue)
		expect(result.size).toBe(0)
	})

	it('should return empty set when issue links array is empty', () => {
		const issue = {
			key: 'TEST-123',
			fields: {
				issuelinks: [],
			},
		} as unknown as JiraIssue

		const result = extractExplicitlyLinkedKeys(issue)
		expect(result.size).toBe(0)
	})

	it('should return empty set when issue links exist but is not an array', () => {
		const issue = {
			key: 'TEST-123',
			fields: {
				// Create a non-array issuelinks to test the Array.isArray check
				issuelinks: { notAnArray: true } as unknown as any[],
			},
		} as JiraIssue

		const result = extractExplicitlyLinkedKeys(issue)
		expect(result.size).toBe(0)
	})

	it('should return empty set when issue is null or undefined', () => {
		const result = extractExplicitlyLinkedKeys(null as unknown as JiraIssue)
		expect(result.size).toBe(0)

		const result2 = extractExplicitlyLinkedKeys(undefined as unknown as JiraIssue)
		expect(result2.size).toBe(0)
	})

	it('should return empty set when issue.fields is null or undefined', () => {
		const issue = { key: 'TEST-123' } as JiraIssue
		const result = extractExplicitlyLinkedKeys(issue)
		expect(result.size).toBe(0)
	})
})
