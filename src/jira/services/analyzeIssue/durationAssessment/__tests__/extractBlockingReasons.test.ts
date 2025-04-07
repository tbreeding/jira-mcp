import { extractBlockingReasons } from '../extractBlockingReasons'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { BlockedPeriod } from '../types/durationAssessment.types'

describe('extractBlockingReasons', () => {
	it('should return the same array when no blocked periods are provided', () => {
		const blockedPeriods: BlockedPeriod[] = []
		const commentsResponse: IssueCommentResponse = {
			comments: [],
		} as unknown as IssueCommentResponse

		const result = extractBlockingReasons(blockedPeriods, commentsResponse)
		expect(result).toBe(blockedPeriods)
	})

	it('should return the same array when no comments are provided', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: null,
			},
		]
		const commentsResponse: IssueCommentResponse = {
			comments: [],
			startAt: 0,
			maxResults: 50,
			total: 0,
		} as unknown as IssueCommentResponse

		const result = extractBlockingReasons(blockedPeriods, commentsResponse)
		expect(result).toBe(blockedPeriods)
	})

	it('should extract reasons from comments close to the block start time', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: null,
			},
		]

		const commentsResponse: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					body: 'This issue is blocked by external team',
					created: '2023-01-01T13:00:00.000Z', // Within 24 hours of block start
					author: { displayName: 'Test User' },
				},
				{
					id: '2',
					body: 'Another comment that is not related',
					created: '2023-01-05T12:00:00.000Z', // Not close to block start
					author: { displayName: 'Test User' },
				},
			],
		} as unknown as IssueCommentResponse

		const result = extractBlockingReasons(blockedPeriods, commentsResponse)
		expect(result).toEqual([
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: 'This issue is blocked by external team',
			},
		])
	})

	it('should handle complex comment format', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: null,
			},
		]

		const commentsResponse: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					body: { content: 'Complex comment format' }, // Atlassian document format
					created: '2023-01-01T13:00:00.000Z', // Within 24 hours of block start
					author: { displayName: 'Test User' },
				},
			],
		} as unknown as IssueCommentResponse

		const result = extractBlockingReasons(blockedPeriods, commentsResponse)
		expect(result).toEqual([
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: 'Found in comment (complex format)',
			},
		])
	})

	it('should overwrite existing reasons with comment content', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: 'Already has a reason',
			},
		]

		const commentsResponse: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					body: 'This issue is blocked by external team',
					created: '2023-01-01T13:00:00.000Z', // Within 24 hours of block start
					author: { displayName: 'Test User' },
				},
			],
		} as unknown as IssueCommentResponse

		const result = extractBlockingReasons(blockedPeriods, commentsResponse)
		expect(result).toEqual([
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: 'This issue is blocked by external team',
			},
		])
	})

	it('should process multiple blocked periods', () => {
		const blockedPeriods: BlockedPeriod[] = [
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: null,
			},
			{
				startTime: '2023-01-10T12:00:00.000Z',
				endTime: '2023-01-15T12:00:00.000Z',
				reason: null,
			},
		]

		const commentsResponse: IssueCommentResponse = {
			comments: [
				{
					id: '1',
					body: 'Blocked by Team A',
					created: '2023-01-01T13:00:00.000Z', // Close to first block
					author: { displayName: 'Test User' },
				},
				{
					id: '2',
					body: 'Now blocked by approval process',
					created: '2023-01-10T12:30:00.000Z', // Close to second block
					author: { displayName: 'Test User' },
				},
			],
		} as unknown as IssueCommentResponse

		const result = extractBlockingReasons(blockedPeriods, commentsResponse)
		expect(result).toEqual([
			{
				startTime: '2023-01-01T12:00:00.000Z',
				endTime: '2023-01-03T12:00:00.000Z',
				reason: 'Blocked by Team A',
			},
			{
				startTime: '2023-01-10T12:00:00.000Z',
				endTime: '2023-01-15T12:00:00.000Z',
				reason: 'Now blocked by approval process',
			},
		])
	})
})
