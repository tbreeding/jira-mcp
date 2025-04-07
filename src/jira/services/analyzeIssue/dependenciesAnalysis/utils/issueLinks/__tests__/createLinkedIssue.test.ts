import { createLinkedIssue } from '../createLinkedIssue'

describe('createLinkedIssue', () => {
	it('should create a LinkedIssue with all values provided', () => {
		const result = createLinkedIssue('TEST-123', 'Test issue', 'relates to')

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'Test issue',
			relationship: 'relates to',
		})
	})

	it('should use default summary when not provided', () => {
		const result = createLinkedIssue('TEST-123', undefined, 'relates to')

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'No summary available',
			relationship: 'relates to',
		})
	})

	it('should use default relationship when not provided', () => {
		const result = createLinkedIssue('TEST-123', 'Test issue')

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'Test issue',
			relationship: 'related to',
		})
	})

	it('should use default values when only key is provided', () => {
		const result = createLinkedIssue('TEST-123')

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'No summary available',
			relationship: 'related to',
		})
	})

	it('should handle empty string summary', () => {
		const result = createLinkedIssue('TEST-123', '', 'relates to')

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'No summary available',
			relationship: 'relates to',
		})
	})

	it('should handle empty string relationship', () => {
		const result = createLinkedIssue('TEST-123', 'Test issue', '')

		expect(result).toEqual({
			key: 'TEST-123',
			summary: 'Test issue',
			relationship: 'related to',
		})
	})
})
