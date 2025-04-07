import { mapLinkToLinkedIssue } from '../mapLinkToLinkedIssue'
import type { IssueLink } from '../../../../../../types/issue.types'

describe('mapLinkToLinkedIssue', () => {
	it('should map inward issue link to LinkedIssue', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Blocks',
				inward: 'is blocked by',
				outward: 'blocks',
			},
			inwardIssue: {
				id: '456',
				key: 'TEST-123',
				fields: {
					summary: 'Test Issue',
				},
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'Test Issue',
			relationship: 'is blocked by',
		})
	})

	it('should map outward issue link to LinkedIssue', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Blocks',
				inward: 'is blocked by',
				outward: 'blocks',
			},
			outwardIssue: {
				id: '456',
				key: 'TEST-123',
				fields: {
					summary: 'Test Issue',
				},
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'Test Issue',
			relationship: 'blocks',
		})
	})

	it('should handle inward issue without summary', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Blocks',
				inward: 'is blocked by',
				outward: 'blocks',
			},
			inwardIssue: {
				id: '456',
				key: 'TEST-123',
				fields: {},
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'No summary available',
			relationship: 'is blocked by',
		})
	})

	it('should handle outward issue without summary', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Blocks',
				outward: 'blocks',
			},
			outwardIssue: {
				id: '456',
				key: 'TEST-123',
				fields: {},
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'No summary available',
			relationship: 'blocks',
		})
	})

	it('should handle link without inward relationship type', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Related',
				outward: 'relates to',
			},
			inwardIssue: {
				id: '456',
				key: 'TEST-123',
				fields: {
					summary: 'Test Issue',
				},
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'Test Issue',
			relationship: 'related to',
		})
	})

	it('should handle link without outward relationship type', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Related',
				inward: 'relates to',
			},
			outwardIssue: {
				id: '456',
				key: 'TEST-123',
				fields: {
					summary: 'Test Issue',
				},
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'Test Issue',
			relationship: 'related to',
		})
	})

	it('should handle null link', () => {
		const result = mapLinkToLinkedIssue(null as any)

		expect(result).toEqual({
			key: 'unknown',
			summary: 'No data available',
			relationship: 'related to',
		})
	})

	it('should handle undefined link', () => {
		const result = mapLinkToLinkedIssue(undefined as any)

		expect(result).toEqual({
			key: 'unknown',
			summary: 'No data available',
			relationship: 'related to',
		})
	})

	it('should handle link with neither inward nor outward issues', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Related',
				inward: 'related to',
				outward: 'related to',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'unknown',
			summary: 'No data available',
			relationship: 'related to',
		})
	})

	it('should handle nullish inwardIssue', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Related',
				inward: 'related to',
				outward: 'related to',
			},
			inwardIssue: null,
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'unknown',
			summary: 'No data available',
			relationship: 'related to',
		})
	})

	it('should handle nullish outwardIssue', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Related',
				inward: 'related to',
				outward: 'related to',
			},
			outwardIssue: null,
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'unknown',
			summary: 'No data available',
			relationship: 'related to',
		})
	})

	it('should handle inward issue without type', () => {
		const link = {
			id: '123',
			inwardIssue: {
				id: '456',
				key: 'TEST-123',
				fields: {
					summary: 'Test Issue',
				},
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'Test Issue',
			relationship: 'related to',
		})
	})

	it('should handle outward issue without type', () => {
		const link = {
			id: '123',
			outwardIssue: {
				id: '456',
				key: 'TEST-123',
				fields: {
					summary: 'Test Issue',
				},
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'Test Issue',
			relationship: 'related to',
		})
	})

	it('should handle inward issue without fields', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Related',
				inward: 'related to',
				outward: 'related to',
			},
			inwardIssue: {
				id: '456',
				key: 'TEST-123',
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'No summary available',
			relationship: 'related to',
		})
	})

	it('should handle outward issue without fields', () => {
		const link = {
			id: '123',
			type: {
				id: '1',
				name: 'Related',
				inward: 'related to',
				outward: 'related to',
			},
			outwardIssue: {
				id: '456',
				key: 'TEST-123',
				self: 'https://jira.example.com/rest/api/2/issue/456',
			},
		} as unknown as IssueLink

		const result = mapLinkToLinkedIssue(link)

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'No summary available',
			relationship: 'related to',
		})
	})
})
