import { mapLinkToLinkedIssue } from '../../utils/issueLinks/mapLinkToLinkedIssue'
import { extractRelatedIssues, isNonRelatedLink } from '../extractRelatedIssues'
import type { JiraIssue, IssueLink } from '../../../../../types/issue.types'

describe('extractRelatedIssues', () => {
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

	it('should extract related issues excluding blockers', () => {
		const result = extractRelatedIssues(mockIssue)

		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-789')
		expect(result[0].summary).toBe('Related issue')
		expect(result[0].relationship).toBe('relates to')
	})

	it('should return empty array when no issue links exist', () => {
		const issueWithoutLinks = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueWithoutLinks)
		expect(result).toHaveLength(0)
	})

	it('should return empty array when issue links array is empty', () => {
		const issueWithEmptyLinks = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [],
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueWithEmptyLinks)
		expect(result).toHaveLength(0)
	})
})

describe('isNonRelatedLink', () => {
	it('should return true for a blocker link', () => {
		const link = {
			type: {
				name: 'Blocks',
				inward: 'is blocked by',
				outward: 'blocks',
			},
			inwardIssue: {
				key: 'TEST-456',
			},
		} as IssueLink

		expect(isNonRelatedLink(link)).toBe(true)
	})

	it('should return true for a link without type', () => {
		const link = {
			inwardIssue: {
				key: 'TEST-456',
			},
		} as IssueLink

		expect(isNonRelatedLink(link)).toBe(true)
	})

	it('should return true for a link with no connected issues', () => {
		const link = {
			type: {
				name: 'Related',
				inward: 'relates to',
				outward: 'relates to',
			},
		} as IssueLink

		expect(isNonRelatedLink(link)).toBe(true)
	})

	it('should return false for a valid related link', () => {
		const link = {
			type: {
				name: 'Related',
				inward: 'relates to',
				outward: 'relates to',
			},
			outwardIssue: {
				key: 'TEST-789',
			},
		} as IssueLink

		expect(isNonRelatedLink(link)).toBe(false)
	})
})

describe('mapLinkToLinkedIssue', () => {
	it('should map inward link to LinkedIssue object', () => {
		const link = {
			type: {
				name: 'Related',
				inward: 'relates to',
				outward: 'relates to',
			},
			inwardIssue: {
				key: 'TEST-456',
				fields: {
					summary: 'Related issue',
				},
			},
		} as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result.key).toBe('TEST-456')
		expect(result.summary).toBe('Related issue')
		expect(result.relationship).toBe('relates to')
	})

	it('should map outward link to LinkedIssue object', () => {
		const link = {
			type: {
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
		} as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result.key).toBe('TEST-789')
		expect(result.summary).toBe('Related issue')
		expect(result.relationship).toBe('relates to')
	})

	it('should handle missing summary for inward issue', () => {
		const link = {
			type: {
				name: 'Related',
				inward: 'relates to',
				outward: 'relates to',
			},
			inwardIssue: {
				key: 'TEST-456',
				fields: {},
			},
		} as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result.key).toBe('TEST-456')
		expect(result.summary).toBe('No summary available')
	})

	it('should fall back to default values for unexpected link structure', () => {
		const link = {} as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result.key).toBe('unknown')
		expect(result.summary).toBe('No data available')
		expect(result.relationship).toBe('related to')
	})
})
