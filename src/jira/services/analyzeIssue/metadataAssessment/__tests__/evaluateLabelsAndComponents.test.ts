import { evaluateLabelsAndComponents } from '../evaluateLabelsAndComponents'
import type { JiraIssue } from '../../../../types/issue.types'

describe('evaluateLabelsAndComponents', () => {
	it('should return false when neither labels nor components exist', () => {
		const mockIssue = {
			fields: {
				labels: [],
				components: [],
			},
		} as unknown as JiraIssue

		expect(evaluateLabelsAndComponents(mockIssue)).toBe(false)
	})

	it('should return false when labels array is undefined and no components exist', () => {
		const mockIssue = {
			fields: {
				components: [],
			},
		} as unknown as JiraIssue

		expect(evaluateLabelsAndComponents(mockIssue)).toBe(false)
	})

	it('should return false when components array is undefined and no labels exist', () => {
		const mockIssue = {
			fields: {
				labels: [],
			},
		} as unknown as JiraIssue

		expect(evaluateLabelsAndComponents(mockIssue)).toBe(false)
	})

	it('should return true when components exist even without labels', () => {
		const mockIssue = {
			fields: {
				labels: [],
				components: [{ id: '1', name: 'Authentication' }],
			},
		} as unknown as JiraIssue

		expect(evaluateLabelsAndComponents(mockIssue)).toBe(true)
	})

	it('should return true when all required label categories are present', () => {
		const mockIssue = {
			fields: {
				labels: ['frontend', 'feature'],
				components: [],
			},
		} as unknown as JiraIssue

		expect(evaluateLabelsAndComponents(mockIssue)).toBe(true)
	})

	it('should return false when only some required label categories are present', () => {
		const mockIssue = {
			fields: {
				labels: ['frontend'], // Missing a work type label
				components: [],
			},
		} as unknown as JiraIssue

		expect(evaluateLabelsAndComponents(mockIssue)).toBe(false)
	})

	it('should return true with multiple labels from each category', () => {
		const mockIssue = {
			fields: {
				labels: ['frontend', 'api', 'feature', 'documentation'],
				components: [],
			},
		} as unknown as JiraIssue

		expect(evaluateLabelsAndComponents(mockIssue)).toBe(true)
	})
})
