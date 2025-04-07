import { countAssignmentChanges } from '../countAssignmentChanges'
import type { JiraIssue } from '../../../../types/issue.types'

describe('countAssignmentChanges', () => {
	it('should return 0 when there are no assignment changes', () => {
		// Mock JiraIssue with no assignment changes
		const mockIssue = {
			expand: '',
			id: '123',
			self: 'https://example.com/123',
			key: 'TEST-123',
			changelog: {
				histories: [
					{
						items: [{ field: 'status' }, { field: 'priority' }],
					},
				],
				startAt: 0,
				maxResults: 1,
				total: 1,
			},
			fields: {
				summary: 'Test issue',
			},
		} as unknown as JiraIssue

		expect(countAssignmentChanges(mockIssue)).toBe(0)
	})

	it('should return the correct count of assignment changes', () => {
		// Mock JiraIssue with assignment changes
		const mockIssue = {
			expand: '',
			id: '123',
			self: 'https://example.com/123',
			key: 'TEST-123',
			changelog: {
				histories: [
					{
						items: [{ field: 'assignee' }],
					},
					{
						items: [{ field: 'status' }],
					},
					{
						items: [{ field: 'assignee' }],
					},
					{
						items: [{ field: 'priority' }, { field: 'assignee' }],
					},
				],
				startAt: 0,
				maxResults: 4,
				total: 4,
			},
			fields: {
				summary: 'Test issue',
			},
		} as unknown as JiraIssue

		expect(countAssignmentChanges(mockIssue)).toBe(3)
	})

	it('should handle an empty history array', () => {
		// Mock JiraIssue with empty history array
		const mockIssue = {
			expand: '',
			id: '123',
			self: 'https://example.com/123',
			key: 'TEST-123',
			changelog: {
				histories: [],
				startAt: 0,
				maxResults: 0,
				total: 0,
			},
			fields: {
				summary: 'Test issue',
			},
		} as unknown as JiraIssue

		expect(countAssignmentChanges(mockIssue)).toBe(0)
	})
})
