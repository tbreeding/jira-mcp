import { extractBlockers } from '../explicitDependencies/extractBlockers'
import type { JiraIssue } from '../../../../types/issue.types'

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

	it('should recognize "Blocked by" relationship', () => {
		const issueWithBlockedByRelation = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						type: {
							id: '10000',
							name: 'Blocked by',
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

		const result = extractBlockers(issueWithBlockedByRelation)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-456')
	})

	it('should handle links without type information', () => {
		const issueWithMissingTypeInfo = {
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
								summary: 'Blocking issue',
							},
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractBlockers(issueWithMissingTypeInfo)
		expect(result).toHaveLength(0)
	})

	it('should handle links with missing fields in inwardIssue', () => {
		const issueWithMissingFields = {
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
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractBlockers(issueWithMissingFields)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-456')
		expect(result[0].summary).toBe('No summary available')
	})

	it('should handle edge case with null inwardIssue', () => {
		const issueWithInvalidInward = {
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
						inwardIssue: null,
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractBlockers(issueWithInvalidInward)
		expect(result).toHaveLength(0)
	})

	it('should handle edge case with undefined inwardIssue.key', () => {
		const issueWithMissingKey = {
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
							// Missing key
							fields: {
								summary: 'Blocking issue',
							},
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractBlockers(issueWithMissingKey)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('unknown')
		expect(result[0].summary).toBe('No summary available')
		expect(result[0].relationship).toBe('is blocked by')
	})

	it('should handle edge case with completely empty inwardIssue object', () => {
		const issueWithEmptyInwardIssue = {
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
						inwardIssue: {},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractBlockers(issueWithEmptyInwardIssue)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('unknown')
		expect(result[0].summary).toBe('No data available')
		expect(result[0].relationship).toBe('is blocked by')
	})

	it('should handle inwardIssue with null fields', () => {
		const issueWithNullFields = {
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
							fields: null,
						},
					},
				],
			},
		} as unknown as JiraIssue

		const result = extractBlockers(issueWithNullFields)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-456')
		expect(result[0].summary).toBe('No summary available')
	})

	it('should handle link with missing type.inward', () => {
		const issueWithMissingInward = {
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
							// missing inward
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

		const result = extractBlockers(issueWithMissingInward)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-456')
		expect(result[0].relationship).toBe('blocks')
	})

	it('should recognize link with only inward relationship without name', () => {
		const issueWithOnlyInwardRelation = {
			key: 'TEST-123',
			fields: {
				summary: 'Test issue',
				description: 'Test description',
				issuelinks: [
					{
						id: '1',
						type: {
							id: '10000',
							name: 'CustomType', // Not "Blocks" or "Blocked by"
							inward: 'is blocked by', // But has the correct inward text
							outward: 'custom outward',
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

		const result = extractBlockers(issueWithOnlyInwardRelation)
		expect(result).toHaveLength(1)
		expect(result[0].key).toBe('TEST-456')
		expect(result[0].relationship).toBe('is blocked by')
	})
})
