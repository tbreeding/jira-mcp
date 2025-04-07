import { findMentionedIssueKeys, extractExplicitlyLinkedKeys } from '../findMentionedIssueKeys'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('findMentionedIssueKeys', () => {
	it('should find issue keys in text', () => {
		const text = 'This issue depends on PROJ-123 and is related to PROJ-456.'

		const result = findMentionedIssueKeys(text)

		expect(result).toContain('PROJ-123')
		expect(result).toContain('PROJ-456')
		expect(result).toHaveLength(2)
	})

	it('should handle different project keys', () => {
		const text = 'This issue depends on PROJ-123 and TEST-456.'

		const result = findMentionedIssueKeys(text)

		expect(result).toContain('PROJ-123')
		expect(result).toContain('TEST-456')
		expect(result).toHaveLength(2)
	})

	it('should find issue keys with underscores in project key', () => {
		const text = 'Related to PROJ_A-123.'

		const result = findMentionedIssueKeys(text)

		expect(result).toContain('PROJ_A-123')
		expect(result).toHaveLength(1)
	})

	it('should find issue keys with numbers in project key', () => {
		const text = 'Related to P2P-789.'

		const result = findMentionedIssueKeys(text)

		expect(result).toContain('P2P-789')
		expect(result).toHaveLength(1)
	})

	it('should deduplicate repeated issue keys', () => {
		const text = 'Issue PROJ-123 depends on PROJ-123 too.'

		const result = findMentionedIssueKeys(text)

		expect(result).toContain('PROJ-123')
		expect(result).toHaveLength(1)
	})

	it('should handle text with no issue keys', () => {
		const text = 'This text contains no valid issue keys.'

		const result = findMentionedIssueKeys(text)

		expect(result).toHaveLength(0)
	})

	it('should return empty array for empty text', () => {
		const result = findMentionedIssueKeys('')

		expect(result).toHaveLength(0)
	})

	it('should return empty array for null or undefined text', () => {
		const result = findMentionedIssueKeys(null as unknown as string)

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
		} as unknown as JiraIssue

		const result = extractExplicitlyLinkedKeys(issue)

		expect(result.has('TEST-456')).toBe(true)
		expect(result.has('TEST-789')).toBe(true)
		expect(result.size).toBe(2)
	})

	it('should handle links with only inward issue', () => {
		const issue = {
			key: 'TEST-123',
			fields: {
				issuelinks: [
					{
						inwardIssue: {
							key: 'TEST-456',
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractExplicitlyLinkedKeys(issue)

		expect(result.has('TEST-456')).toBe(true)
		expect(result.size).toBe(1)
	})

	it('should handle links with only outward issue', () => {
		const issue = {
			key: 'TEST-123',
			fields: {
				issuelinks: [
					{
						outwardIssue: {
							key: 'TEST-789',
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractExplicitlyLinkedKeys(issue)

		expect(result.has('TEST-789')).toBe(true)
		expect(result.size).toBe(1)
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

	it('should handle null or undefined issue', () => {
		const result = extractExplicitlyLinkedKeys(null as unknown as JiraIssue)
		expect(result.size).toBe(0)
	})
})
