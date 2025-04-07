import { extractBlockers } from '../extractBlockers'
import { mapBlockerToLinkedIssue } from '../mapBlockerToLinkedIssue'
import type { JiraIssue, IssueLink } from '../../../../../types/issue.types'

describe('extractBlockers', () => {
	const mockIssue = {
		key: 'TEST-123',
		fields: {
			summary: 'Test issue',
			description: 'Test description',
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
						name: 'Related',
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

	it('should extract blocker issues from issue links', () => {
		const result = extractBlockers(mockIssue)

		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-456')
		expect(result[0].summary).toBe('Blocking issue')
		expect(result[0].relationship).toBe('is blocked by')
	})

	it('should return empty array when no issue links exist', () => {
		const issueWithoutLinks = {
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
				description: 'Test description',
			},
		} as unknown as JiraIssue

		const result = extractBlockers(issueWithoutLinks)
		expect(result).toHaveLength(0)
	})

	it('should return empty array when issue links array is empty', () => {
		const issueWithEmptyLinks = {
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
				description: 'Test description',
				issuelinks: [],
			},
		} as unknown as JiraIssue

		const result = extractBlockers(issueWithEmptyLinks)
		expect(result).toHaveLength(0)
	})

	it('should filter out links without inward issue', () => {
		const issueWithInvalidLink = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						type: {
							id: '10000',
							name: 'Blocks',
							inward: 'is blocked by',
							outward: 'blocks',
						},
						// No inwardIssue property
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractBlockers(issueWithInvalidLink)
		expect(result).toHaveLength(0)
	})
})

describe('mapBlockerToLinkedIssue', () => {
	it('should map a valid blocker issue link', () => {
		const link = {
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
		} as IssueLink

		const result = mapBlockerToLinkedIssue(link)
		expect(result.key).toBe('TEST-456')
		expect(result.summary).toBe('Blocking issue')
		expect(result.relationship).toBe('is blocked by')
	})

	it('should handle link with null inwardIssue', () => {
		const link = {
			id: '1',
			self: 'http://example.com',
			type: {
				id: '10000',
				name: 'Blocks',
				inward: 'is blocked by',
				outward: 'blocks',
			},
			inwardIssue: null,
		} as unknown as IssueLink

		const result = mapBlockerToLinkedIssue(link)
		expect(result.key).toBe('unknown')
		expect(result.summary).toBe('No data available')
		expect(result.relationship).toBe('blocks')
	})

	it('should handle link with missing summary', () => {
		const link = {
			id: '1',
			type: {
				id: '10000',
				name: 'Blocks',
				inward: 'is blocked by',
				outward: 'blocks',
			},
			inwardIssue: {
				key: 'TEST-456',
				fields: {},
			},
		} as IssueLink

		const result = mapBlockerToLinkedIssue(link)

		expect(result.key).toBe('TEST-456')
		expect(result.summary).toBe('No summary available')
		expect(result.relationship).toBe('is blocked by')
	})

	it('should handle link with missing type information', () => {
		const link = {
			id: '1',
			inwardIssue: {
				key: 'TEST-456',
				fields: {
					summary: 'Blocking issue',
				},
			},
		} as IssueLink

		const result = mapBlockerToLinkedIssue(link)

		expect(result.key).toBe('TEST-456')
		expect(result.summary).toBe('Blocking issue')
		expect(result.relationship).toBe('blocks')
	})

	it('should handle link with no inward issue', () => {
		const link = {
			id: '1',
			type: {
				id: '10000',
				name: 'Blocks',
				inward: 'is blocked by',
				outward: 'blocks',
			},
		} as IssueLink

		const result = mapBlockerToLinkedIssue(link)

		expect(result.key).toBe('unknown')
		expect(result.summary).toBe('No data available')
		expect(result.relationship).toBe('blocks')
	})
})
