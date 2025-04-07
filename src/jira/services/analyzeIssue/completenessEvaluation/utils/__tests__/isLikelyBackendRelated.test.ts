import { isLikelyBackendRelated } from '../isLikelyBackendRelated'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('isLikelyBackendRelated', () => {
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

	it('should detect backend terms in summary', () => {
		const backendTerms = ['API', 'backend', 'database', 'server', 'endpoint']

		for (const term of backendTerms) {
			const issue = createMockIssue({
				fields: {
					summary: `This is a ${term} related issue`,
				},
			})

			expect(isLikelyBackendRelated(issue)).toBe(true)
		}
	})

	it('should detect backend terms in string description', () => {
		const backendTerms = ['API', 'backend', 'database', 'server', 'endpoint']

		for (const term of backendTerms) {
			const issue = createMockIssue({
				fields: {
					description: `This is a ${term} related issue`,
				},
			})

			expect(isLikelyBackendRelated(issue)).toBe(true)
		}
	})

	it('should detect backend terms in JSON description', () => {
		const issue = createMockIssue({
			fields: {
				description: {
					content: [
						{
							content: [
								{
									text: 'This is an API related issue',
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

		expect(isLikelyBackendRelated(issue)).toBe(true)
	})

	it('should return false when no backend terms are present', () => {
		const issue = createMockIssue({
			fields: {
				summary: 'UI task',
				description: 'Implement new UI component',
			},
		})

		expect(isLikelyBackendRelated(issue)).toBe(false)
	})

	it('should handle undefined summary', () => {
		const issue = createMockIssue({
			fields: {
				summary: null as any,
				description: 'API related issue',
			},
		})

		expect(isLikelyBackendRelated(issue)).toBe(true)
	})

	it('should handle null description', () => {
		const issue = createMockIssue({
			fields: {
				summary: 'API related issue',
				description: null,
			},
		})

		expect(isLikelyBackendRelated(issue)).toBe(true)
	})

	it('should handle undefined description', () => {
		const issue = createMockIssue({
			fields: {
				summary: 'Normal issue',
				description: null,
			},
		})

		expect(isLikelyBackendRelated(issue)).toBe(false)
	})

	it('should handle empty string description', () => {
		const issue = createMockIssue({
			fields: {
				summary: 'Normal issue',
				description: '',
			},
		})

		expect(isLikelyBackendRelated(issue)).toBe(false)
	})
})
