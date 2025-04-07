import { isSignificantField } from '../significantFields'

describe('isSignificantField', () => {
	test('should identify significant fields correctly', () => {
		// Test known significant fields
		const significantFields = [
			'description',
			'summary',
			'issuetype',
			'priority',
			'customfield_10010', // Story points
			'customfield_10000', // Epic link
			'labels',
			'fixVersions',
			'components',
			'assignee',
		]

		significantFields.forEach((field) => {
			expect(isSignificantField(field)).toBe(true)
		})
	})

	test('should return false for non-significant fields', () => {
		// Test some non-significant fields
		const nonSignificantFields = [
			'comment',
			'attachment',
			'worklog',
			'random_field',
			'custom_non_significant',
			'subtasks',
			'status', // Assuming status is not in the significant fields list
		]

		nonSignificantFields.forEach((field) => {
			expect(isSignificantField(field)).toBe(false)
		})
	})

	test('should handle case sensitivity correctly', () => {
		// Fields should match exactly as defined in the array
		expect(isSignificantField('Description')).toBe(false)
		expect(isSignificantField('SUMMARY')).toBe(false)
		expect(isSignificantField('description')).toBe(true)
		expect(isSignificantField('summary')).toBe(true)
	})

	test('should handle empty string', () => {
		expect(isSignificantField('')).toBe(false)
	})
})
