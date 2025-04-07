import { adaptIssueComment } from '../commentAdaptation'
import type { IssueComment } from '../../../../../types/comment'

describe('adaptIssueComment', () => {
	it('should adapt comment with Date object created field', () => {
		// Setup
		const date = new Date('2023-01-01T12:00:00Z')
		const comment: IssueComment = {
			created: date,
			body: { content: 'test body' },
			author: {
				displayName: 'Test User',
			},
		} as unknown as IssueComment

		// Execute
		const result = adaptIssueComment(comment)

		// Verify
		expect(result).toEqual({
			created: date.toISOString(),
			body: { content: 'test body' },
			author: {
				displayName: 'Test User',
			},
		})
	})

	it('should adapt comment with string created field', () => {
		// Setup
		const dateString = '2023-01-01T12:00:00Z'
		const comment: IssueComment = {
			created: dateString,
			body: { content: 'test body' },
			author: {
				displayName: 'Test User',
			},
		} as unknown as IssueComment

		// Execute
		const result = adaptIssueComment(comment)

		// Verify
		expect(result).toEqual({
			created: dateString,
			body: { content: 'test body' },
			author: {
				displayName: 'Test User',
			},
		})
	})

	it('should handle missing author', () => {
		// Setup
		const comment: IssueComment = {
			created: '2023-01-01T12:00:00Z',
			body: { content: 'test body' },
			author: undefined,
		} as unknown as IssueComment

		// Execute
		const result = adaptIssueComment(comment)

		// Verify
		expect(result).toEqual({
			created: '2023-01-01T12:00:00Z',
			body: { content: 'test body' },
			author: {
				displayName: undefined,
			},
		})
	})
})
