import { hasResolutionDate, createResolutionEvent } from '../resolutionHandling'
import type { JiraIssue } from '../../../../../types/issue.types'

describe('resolutionHandling', () => {
	describe('hasResolutionDate', () => {
		test('should return true if issue has a valid resolution date string', () => {
			// Setup
			const mockIssue = {
				fields: {
					resolutiondate: '2023-01-01T10:00:00.000Z',
				},
			} as unknown as JiraIssue

			// Execute
			const result = hasResolutionDate(mockIssue)

			// Verify
			expect(result).toBe(true)
		})

		test('should return false if issue has no resolution date', () => {
			// Setup
			const mockIssue = {
				fields: {
					// No resolutiondate
				},
			} as unknown as JiraIssue

			// Execute
			const result = hasResolutionDate(mockIssue)

			// Verify
			expect(result).toBe(false)
		})

		test('should return false if resolution date is not a string', () => {
			// Setup
			const mockIssue = {
				fields: {
					resolutiondate: null,
				},
			} as unknown as JiraIssue

			// Execute
			const result = hasResolutionDate(mockIssue)

			// Verify
			expect(result).toBe(false)
		})
	})

	describe('createResolutionEvent', () => {
		test('should create resolution event with all fields populated', () => {
			// Setup
			const mockIssue = {
				fields: {
					resolutiondate: '2023-01-01T10:00:00.000Z',
					status: { name: 'Done' },
					assignee: { displayName: 'Test User' },
				},
			} as unknown as JiraIssue

			// Execute
			const result = createResolutionEvent(mockIssue)

			// Verify
			expect(result).toEqual({
				date: new Date('2023-01-01T10:00:00.000Z'),
				status: 'Done',
				assignee: 'Test User',
			})
		})

		// Test for line 24 - handling when fields.status is null/undefined
		test('should handle missing status field', () => {
			// Setup
			const mockIssue = {
				fields: {
					resolutiondate: '2023-01-01T10:00:00.000Z',
					// No status field
					assignee: { displayName: 'Test User' },
				},
			} as unknown as JiraIssue

			// Execute
			const result = createResolutionEvent(mockIssue)

			// Verify
			expect(result).toEqual({
				date: new Date('2023-01-01T10:00:00.000Z'),
				status: null,
				assignee: 'Test User',
			})
		})

		// Test for line 24 - handling when fields.assignee is null/undefined
		test('should handle missing assignee field', () => {
			// Setup
			const mockIssue = {
				fields: {
					resolutiondate: '2023-01-01T10:00:00.000Z',
					status: { name: 'Done' },
					// No assignee field
				},
			} as unknown as JiraIssue

			// Execute
			const result = createResolutionEvent(mockIssue)

			// Verify
			expect(result).toEqual({
				date: new Date('2023-01-01T10:00:00.000Z'),
				status: 'Done',
				assignee: null,
			})
		})
	})
})
