import { isRelevantComment } from '../isRelevantComment'
import type { IssueComment } from '../../../../../types/comment'

describe('isRelevantComment', () => {
	const blockStartTime = '2023-01-01T10:00:00.000Z'

	test('returns true for comments within 24 hours before block start', () => {
		const comment = {
			id: '1',
			created: new Date('2023-01-01T00:00:00.000Z'), // 10 hours before
			updated: new Date('2023-01-01T00:00:00.000Z'),
			body: 'Comment before block start' as any,
			self: 'self-url',
			jsdPublic: true,
		} as IssueComment

		expect(isRelevantComment(comment, blockStartTime)).toBe(true)
	})

	test('returns true for comments within 24 hours after block start', () => {
		const comment = {
			id: '1',
			created: new Date('2023-01-02T05:00:00.000Z'), // 19 hours after
			updated: new Date('2023-01-02T05:00:00.000Z'),
			body: 'Comment after block start' as any,
			self: 'self-url',
			jsdPublic: true,
		} as IssueComment

		expect(isRelevantComment(comment, blockStartTime)).toBe(true)
	})

	test('returns true for comments at exactly block start time', () => {
		const comment = {
			id: '1',
			created: new Date('2023-01-01T10:00:00.000Z'), // exact same time
			updated: new Date('2023-01-01T10:00:00.000Z'),
			body: 'Comment at block start' as any,
			self: 'self-url',
			jsdPublic: true,
		} as IssueComment

		expect(isRelevantComment(comment, blockStartTime)).toBe(true)
	})

	test('returns false for comments more than 24 hours before block start', () => {
		const comment = {
			id: '1',
			created: new Date('2022-12-30T10:00:00.000Z'), // 2 days before
			updated: new Date('2022-12-30T10:00:00.000Z'),
			body: 'Comment too early' as any,
			self: 'self-url',
			jsdPublic: true,
		} as IssueComment

		expect(isRelevantComment(comment, blockStartTime)).toBe(false)
	})

	test('returns false for comments more than 24 hours after block start', () => {
		const comment = {
			id: '1',
			created: new Date('2023-01-02T11:00:00.000Z'), // 25 hours after
			updated: new Date('2023-01-02T11:00:00.000Z'),
			body: 'Comment too late' as any,
			self: 'self-url',
			jsdPublic: true,
		} as IssueComment

		expect(isRelevantComment(comment, blockStartTime)).toBe(false)
	})
})
