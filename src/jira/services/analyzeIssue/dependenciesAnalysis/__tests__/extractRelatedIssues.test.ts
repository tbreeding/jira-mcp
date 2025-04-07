import { extractRelatedIssues } from '../explicitDependencies/extractRelatedIssues'
import type { JiraIssue } from '../../../../types/issue.types'

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

	it('should extract related issues from issue links', () => {
		const result = extractRelatedIssues(mockIssue)

		expect(result).toHaveLength(1) // Only one related issue (non-blocker)

		// Blocks links are filtered out in this function, so we only check for the outward issue
		const outwardIssue = result.find((issue) => issue.key === 'TEST-789')
		expect(outwardIssue).toBeDefined()
		expect(outwardIssue?.summary).toBe('Related issue')
		expect(outwardIssue?.relationship).toBe('relates to')
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

	it('should filter out links without type information', () => {
		const issueWithInvalidLink = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						inwardIssue: {
							key: 'TEST-456',
							fields: {
								summary: 'Related issue',
							},
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueWithInvalidLink)
		expect(result).toHaveLength(0)
	})

	it('should filter out blocker links', () => {
		const issueWithOnlyBlockers = {
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
				],
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueWithOnlyBlockers)
		expect(result).toHaveLength(0)
	})

	it('should handle inward links', () => {
		const issueWithInwardLink = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						type: {
							id: '10001',
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
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueWithInwardLink)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-456')
		expect(result[0].relationship).toBe('relates to')
	})

	it('should handle outward links', () => {
		const issueWithOutwardLink = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
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

		const result = extractRelatedIssues(issueWithOutwardLink)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-789')
		expect(result[0].relationship).toBe('relates to')
	})

	it('should handle links with missing summary in inward issue', () => {
		const issueWithMissingSummary = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						type: {
							id: '10001',
							name: 'Related',
							inward: 'relates to',
							outward: 'relates to',
						},
						inwardIssue: {
							key: 'TEST-456',
							fields: {},
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueWithMissingSummary)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-456')
		expect(result[0].summary).toBe('No summary available')
	})

	it('should handle links with missing summary in outward issue', () => {
		const issueWithMissingSummary = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						type: {
							id: '10001',
							name: 'Related',
							inward: 'relates to',
							outward: 'relates to',
						},
						outwardIssue: {
							key: 'TEST-789',
							fields: {},
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueWithMissingSummary)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-789')
		expect(result[0].summary).toBe('No summary available')
	})

	// New test cases to cover empty inward/outward issue objects
	it('should handle empty inward issue object', () => {
		const issueWithEmptyInwardIssue = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						type: {
							id: '10001',
							name: 'Related',
							inward: 'relates to',
							outward: 'relates to',
						},
						inwardIssue: {},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueWithEmptyInwardIssue)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('unknown')
		expect(result[0].summary).toBe('No data available')
		expect(result[0].relationship).toBe('relates to')
	})

	it('should handle empty outward issue object', () => {
		const issueWithEmptyOutwardIssue = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						type: {
							id: '10001',
							name: 'Related',
							inward: 'relates to',
							outward: 'relates to',
						},
						outwardIssue: {},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueWithEmptyOutwardIssue)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('unknown')
		expect(result[0].summary).toBe('No data available')
		expect(result[0].relationship).toBe('relates to')
	})

	it('should handle link with neither inward nor outward issue', () => {
		const issueLinkWithoutDirections = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						type: {
							id: '10001',
							name: 'Related',
							inward: 'relates to',
							outward: 'relates to',
						},
						// No inwardIssue or outwardIssue
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractRelatedIssues(issueLinkWithoutDirections)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('unknown')
		expect(result[0].summary).toBe('No data available')
		expect(result[0].relationship).toBe('relates to')
	})
})
