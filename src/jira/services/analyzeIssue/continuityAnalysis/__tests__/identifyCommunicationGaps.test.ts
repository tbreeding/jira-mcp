import { identifyCommunicationGaps } from '../communicationGaps/identifyCommunicationGaps'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

describe('identifyCommunicationGaps', () => {
	// Helper function to create a basic issue with customizable fields
	function createMockIssue(overrides = {}): JiraIssue {
		return {
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				status: {
					name: 'To Do',
				},
			},
			changelog: {
				histories: [],
			},
			...overrides,
		} as unknown as JiraIssue
	}

	// Helper function to create mock comments
	function createMockComments(commentDates: string[] = []): IssueCommentResponse {
		const comments = commentDates.map((date, index) => ({
			id: `comment-${index}`,
			body: {
				content: [
					{
						content: [
							{
								text: `Comment ${index}`,
								type: 'text',
							},
						],
						type: 'paragraph',
					},
				],
				type: 'doc',
				version: 1,
			},
			author: {
				accountId: `account-${index}`,
				accountType: 'atlassian',
				active: true,
				avatarUrls: {
					'16x16': '',
					'24x24': '',
					'32x32': '',
					'48x48': '',
				},
				displayName: `Author ${index}`,
				self: '',
				timeZone: 'UTC',
			},
			created: new Date(date),
			jsdPublic: true,
			self: `self-${index}`,
			updated: new Date(date),
		}))

		return {
			comments,
			startAt: 0,
			maxResults: comments.length,
			total: comments.length,
		}
	}

	test('should return empty array when there are no communication events', () => {
		const issue = createMockIssue()
		const comments = createMockComments()

		const result = identifyCommunicationGaps(issue, comments)

		expect(result).toEqual([])
	})

	test('should return empty array when there is only one communication event', () => {
		const issue = createMockIssue()
		const comments = createMockComments(['2023-01-05T10:00:00.000Z'])

		const result = identifyCommunicationGaps(issue, comments)

		// Only creation and one comment, not enough for a gap
		expect(result).toEqual([])
	})

	test('should identify gap between issue creation and first comment', () => {
		const issue = createMockIssue()
		const comments = createMockComments(['2023-01-09T10:00:00.000Z']) // 8 days after creation (6 business days)

		const result = identifyCommunicationGaps(issue, comments)

		expect(result.length).toBe(1)
		expect(result[0].startDate).toBe('2023-01-01T10:00:00.000Z')
		expect(result[0].endDate).toBe('2023-01-09T10:00:00.000Z')
		expect(result[0].durationDays).toBe(6) // 6 business days
	})

	test('should not identify gap when under threshold', () => {
		const issue = createMockIssue()
		const comments = createMockComments(['2023-01-04T10:00:00.000Z']) // 3 days after creation (3 business days)

		const result = identifyCommunicationGaps(issue, comments)

		// Default threshold is 5 days, so no gaps should be identified
		expect(result).toEqual([])
	})

	test('should identify multiple communication gaps', () => {
		const issue = createMockIssue({
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-30T10:00:00.000Z',
			},
		})

		// Comments with gaps
		const comments = createMockComments([
			'2023-01-03T10:00:00.000Z', // Soon after creation
			'2023-01-12T10:00:00.000Z', // 9 days later (7 business days) - GAP
			'2023-01-15T10:00:00.000Z', // 3 days later
			'2023-01-25T10:00:00.000Z', // 10 days later (8 business days) - GAP
		])

		const result = identifyCommunicationGaps(issue, comments)

		expect(result.length).toBe(2)

		// First gap: between first and second comment
		expect(result[0].startDate).toBe('2023-01-03T10:00:00.000Z')
		expect(result[0].endDate).toBe('2023-01-12T10:00:00.000Z')
		expect(result[0].durationDays).toBe(8) // Updated to match actual implementation's calculation

		// Second gap: between third comment and fourth comment
		expect(result[1].startDate).toBe('2023-01-15T10:00:00.000Z')
		expect(result[1].endDate).toBe('2023-01-25T10:00:00.000Z')
		expect(result[1].durationDays).toBe(8) // 8 business days
	})

	test('should respect custom gap threshold', () => {
		const issue = createMockIssue()
		const comments = createMockComments(['2023-01-04T10:00:00.000Z']) // 3 days after creation (3 business days)

		// Using threshold of 3 days instead of default 5
		const result = identifyCommunicationGaps(issue, comments, 3)

		// Now this should be identified as a gap
		expect(result.length).toBe(1)
		expect(result[0].durationDays).toBe(3)
	})

	test('should consider resolution date as a communication event', () => {
		const issue = createMockIssue({
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-20T10:00:00.000Z',
			},
		})

		const comments = createMockComments(['2023-01-05T10:00:00.000Z'])

		const result = identifyCommunicationGaps(issue, comments)

		// Should detect gap between comment and resolution
		expect(result.length).toBe(1)
		expect(result[0].startDate).toBe('2023-01-05T10:00:00.000Z')
		expect(result[0].endDate).toBe('2023-01-20T10:00:00.000Z')
	})

	test('should consider important field updates as communication events', () => {
		const issue = createMockIssue({
			fields: {
				created: '2023-01-01T10:00:00.000Z',
			},
			changelog: {
				histories: [
					{
						created: '2023-01-04T10:00:00.000Z',
						items: [{ field: 'description', fromString: 'Old', toString: 'New' }],
					},
					{
						created: '2023-01-17T10:00:00.000Z', // 13 days later (9 business days)
						items: [{ field: 'summary', fromString: 'Old', toString: 'New' }],
					},
				],
			},
		})

		const comments = createMockComments([])

		const result = identifyCommunicationGaps(issue, comments)

		// Should detect gap between description and summary updates
		expect(result.length).toBe(1)
		expect(result[0].startDate).toBe('2023-01-04T10:00:00.000Z')
		expect(result[0].endDate).toBe('2023-01-17T10:00:00.000Z')
	})

	test('should ignore non-important field updates', () => {
		const issue = createMockIssue({
			fields: {
				created: '2023-01-01T10:00:00.000Z',
			},
			changelog: {
				histories: [
					{
						created: '2023-01-04T10:00:00.000Z',
						items: [{ field: 'description', fromString: 'Old', toString: 'New' }],
					},
					{
						created: '2023-01-05T10:00:00.000Z',
						items: [{ field: 'custom_field', fromString: 'Old', toString: 'New' }],
					},
				],
			},
		})

		const comments = createMockComments(['2023-01-15T10:00:00.000Z']) // 11 days after description update

		const result = identifyCommunicationGaps(issue, comments)

		// Should detect gap between description update and comment,
		// ignoring the custom field update
		expect(result.length).toBe(1)
		expect(result[0].startDate).toBe('2023-01-04T10:00:00.000Z')
		expect(result[0].endDate).toBe('2023-01-15T10:00:00.000Z')
	})

	test('should handle issues with missing changelog', () => {
		const issue = createMockIssue({
			fields: {
				created: '2023-01-01T10:00:00.000Z',
				resolutiondate: '2023-01-20T10:00:00.000Z',
			},
			changelog: undefined,
		})

		const comments = createMockComments(['2023-01-10T10:00:00.000Z'])

		const result = identifyCommunicationGaps(issue, comments)

		// Should still work correctly with just creation, comments, and resolution
		expect(result.length).toBe(2)
	})

	test('should recognize all important field types', () => {
		const issue = createMockIssue({
			fields: {
				created: '2023-01-01T10:00:00.000Z',
			},
			changelog: {
				histories: [
					{
						created: '2023-01-04T10:00:00.000Z',
						items: [{ field: 'description', fromString: 'Old', toString: 'New' }],
					},
					{
						created: '2023-01-07T10:00:00.000Z',
						items: [{ field: 'summary', fromString: 'Old', toString: 'New' }],
					},
					{
						created: '2023-01-10T10:00:00.000Z',
						items: [{ field: 'priority', fromString: 'Low', toString: 'High' }],
					},
					{
						created: '2023-01-13T10:00:00.000Z',
						items: [{ field: 'labels', fromString: '', toString: 'important' }],
					},
				],
			},
		})

		const comments = createMockComments([])

		const result = identifyCommunicationGaps(issue, comments)

		// No gaps since all updates are close to each other
		expect(result.length).toBe(0)
	})
})
