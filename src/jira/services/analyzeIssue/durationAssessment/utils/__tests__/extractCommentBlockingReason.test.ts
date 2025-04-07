import { extractCommentBlockingReason } from '../extractCommentBlockingReason'
import type { IssueCommentResponse } from '../../../../../types/comment'
import type { BlockedPeriod } from '../../types/durationAssessment.types'

describe('extractCommentBlockingReason', () => {
	const mockPeriod: BlockedPeriod = {
		startTime: '2023-01-01T10:00:00.000Z',
		endTime: '2023-01-05T10:00:00.000Z',
		reason: null,
	}

	test('returns period with reason from string comment body', () => {
		const mockComments: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					created: new Date('2023-01-01T10:30:00.000Z'),
					updated: new Date('2023-01-01T10:30:00.000Z'),
					body: 'Waiting for API review' as any,
					self: 'self-url',
					jsdPublic: true,
				},
			],
			startAt: 0,
			maxResults: 10,
			total: 1,
		}

		const result = extractCommentBlockingReason(mockPeriod, mockComments)
		expect(result).toEqual({
			...mockPeriod,
			reason: 'Waiting for API review',
		})
	})

	test('returns period with generic reason for complex comment format', () => {
		const mockComments: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					created: new Date('2023-01-01T10:30:00.000Z'),
					updated: new Date('2023-01-01T10:30:00.000Z'),
					body: { content: [] } as any,
					self: 'self-url',
					jsdPublic: true,
				},
			],
			startAt: 0,
			maxResults: 10,
			total: 1,
		}

		const result = extractCommentBlockingReason(mockPeriod, mockComments)
		expect(result).toEqual({
			...mockPeriod,
			reason: 'Found in comment (complex format)',
		})
	})

	test('returns original period reason when comment body is null', () => {
		const mockPeriodWithReason: BlockedPeriod = {
			...mockPeriod,
			reason: 'Original reason',
		}

		const mockComments: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					created: new Date('2023-01-01T10:30:00.000Z'),
					updated: new Date('2023-01-01T10:30:00.000Z'),
					body: null as any,
					self: 'self-url',
					jsdPublic: true,
				},
			],
			startAt: 0,
			maxResults: 10,
			total: 1,
		}

		const result = extractCommentBlockingReason(mockPeriodWithReason, mockComments)
		expect(result).toEqual(mockPeriodWithReason)
	})

	test('returns original period when no relevant comments exist', () => {
		// Comments outside the 24 hour window
		const mockComments: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					created: new Date('2023-01-03T10:00:00.000Z'),
					updated: new Date('2023-01-03T10:00:00.000Z'),
					body: 'This is too late to be relevant' as any,
					self: 'self-url',
					jsdPublic: true,
				},
			],
			startAt: 0,
			maxResults: 10,
			total: 1,
		}

		const result = extractCommentBlockingReason(mockPeriod, mockComments)
		expect(result).toEqual(mockPeriod)
	})

	test('returns original period when no comments exist', () => {
		const mockComments: IssueCommentResponse = {
			comments: [],
			startAt: 0,
			maxResults: 10,
			total: 0,
		}

		const result = extractCommentBlockingReason(mockPeriod, mockComments)
		expect(result).toEqual(mockPeriod)
	})

	test('returns original period when commentsResponse is undefined', () => {
		const result = extractCommentBlockingReason(mockPeriod, undefined)
		expect(result).toEqual(mockPeriod)
	})
})
