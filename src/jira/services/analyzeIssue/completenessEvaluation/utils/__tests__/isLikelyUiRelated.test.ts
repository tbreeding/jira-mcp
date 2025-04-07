import { isLikelyUiRelated } from '../isLikelyUiRelated'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('isLikelyUiRelated', () => {
	// Helper to create a mock issue
	function createMockIssue(override: { fields?: Partial<any> } = {}): JiraIssue {
		const baseFields = {
			summary: 'Test Issue',
			issuetype: {
				name: 'Task',
			},
		}

		const fields = override.fields ? { ...baseFields, ...override.fields } : baseFields

		return {
			id: '12345',
			key: 'TEST-123',
			self: 'https://example.com/jira/rest/api/2/issue/12345',
			fields,
		} as unknown as JiraIssue
	}

	it('should detect UI terms in summary', () => {
		const uiTerms = ['UI', 'interface', 'frontend', 'screen', 'design', 'ux', 'visual']

		for (const term of uiTerms) {
			const issue = createMockIssue({
				fields: {
					summary: `This is a ${term} related issue`,
				},
			})

			expect(isLikelyUiRelated(issue)).toBe(true)
		}
	})

	it('should detect UI terms in string description', () => {
		const uiTerms = ['UI', 'interface', 'frontend', 'screen', 'design', 'ux', 'visual']

		for (const term of uiTerms) {
			const issue = createMockIssue({
				fields: {
					description: `This is a ${term} related issue`,
				},
			})

			expect(isLikelyUiRelated(issue)).toBe(true)
		}
	})

	it('should detect UI terms in JSON description', () => {
		const issue = createMockIssue({
			fields: {
				description: {
					content: [
						{
							content: [
								{
									text: 'This is a UI related issue',
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
		})

		expect(isLikelyUiRelated(issue)).toBe(true)
	})

	it('should return false when no UI terms are present', () => {
		const issue = createMockIssue({
			fields: {
				summary: 'Backend task',
				description: 'Implement new API endpoint',
			},
		})

		expect(isLikelyUiRelated(issue)).toBe(false)
	})

	it('should handle undefined summary', () => {
		const issue = createMockIssue({
			fields: {
				summary: null as any,
				description: 'UI related issue',
			},
		})

		expect(isLikelyUiRelated(issue)).toBe(true)
	})

	it('should handle null description', () => {
		const issue = createMockIssue({
			fields: {
				summary: 'UI related issue',
				description: null,
			},
		})

		expect(isLikelyUiRelated(issue)).toBe(true)
	})

	it('should handle undefined description', () => {
		const issue = createMockIssue({
			fields: {
				summary: 'Normal issue',
				description: null,
			},
		})

		expect(isLikelyUiRelated(issue)).toBe(false)
	})

	it('should handle empty string description', () => {
		const issue = createMockIssue({
			fields: {
				summary: 'Normal issue',
				description: '',
			},
		})

		expect(isLikelyUiRelated(issue)).toBe(false)
	})
})
