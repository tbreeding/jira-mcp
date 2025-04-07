import { calculateCommunicationFrequencyScore } from '../communicationFrequency'
import type { IssueCommentResponse } from '../../../../../types/comment'

describe('Communication Frequency', () => {
	describe('calculateCommunicationFrequencyScore', () => {
		test('should return low score (3) for no comments', () => {
			const emptyComments: IssueCommentResponse = {
				comments: [],
				maxResults: 0,
				startAt: 0,
				total: 0,
			}

			const score = calculateCommunicationFrequencyScore(emptyComments)

			expect(score).toBe(3)
		})

		test('should return low score (3) for null or undefined comments', () => {
			const nullComments = null as unknown as IssueCommentResponse
			const undefinedCommentsObj = {} as IssueCommentResponse

			expect(calculateCommunicationFrequencyScore(nullComments)).toBe(3)
			expect(calculateCommunicationFrequencyScore(undefinedCommentsObj)).toBe(3)
		})

		test('should calculate score for 1 comment with no diversity bonus', () => {
			const oneComment: IssueCommentResponse = {
				comments: [
					{
						id: '1',
						author: { displayName: 'User A' },
					} as unknown as any,
				],
				maxResults: 1,
				startAt: 0,
				total: 1,
			}

			const score = calculateCommunicationFrequencyScore(oneComment)

			// Base score for 1 comment is 3, no diversity bonus
			expect(score).toBe(3)
		})

		test('should calculate score for 2 comments with no diversity bonus', () => {
			const twoComments: IssueCommentResponse = {
				comments: [
					{
						id: '1',
						author: { displayName: 'User A' },
					} as unknown as any,
					{
						id: '2',
						author: { displayName: 'User A' },
					} as unknown as any,
				],
				maxResults: 2,
				startAt: 0,
				total: 2,
			}

			const score = calculateCommunicationFrequencyScore(twoComments)

			// Base score for 2 comments is 4, no diversity bonus
			expect(score).toBe(4)
		})

		test('should calculate score for 3 comments with no diversity bonus (same author)', () => {
			const threeComments: IssueCommentResponse = {
				comments: [
					{
						id: '1',
						author: { displayName: 'User A' },
					} as unknown as any,
					{
						id: '2',
						author: { displayName: 'User A' },
					} as unknown as any,
					{
						id: '3',
						author: { displayName: 'User A' },
					} as unknown as any,
				],
				maxResults: 3,
				startAt: 0,
				total: 3,
			}

			const score = calculateCommunicationFrequencyScore(threeComments)

			// Base score for 3 comments is 5, no diversity bonus
			expect(score).toBe(5)
		})

		test('should calculate score for 3 comments with diversity bonus (+1 for 3 unique commenters)', () => {
			const threeCommentsThreeAuthors: IssueCommentResponse = {
				comments: [
					{
						id: '1',
						author: { displayName: 'User A' },
					} as unknown as any,
					{
						id: '2',
						author: { displayName: 'User B' },
					} as unknown as any,
					{
						id: '3',
						author: { displayName: 'User C' },
					} as unknown as any,
				],
				maxResults: 3,
				startAt: 0,
				total: 3,
			}

			const score = calculateCommunicationFrequencyScore(threeCommentsThreeAuthors)

			// Base score for 3 comments is 5, +1 diversity bonus for 3 unique commenters
			expect(score).toBe(6)
		})

		test('should calculate score for 4 comments with higher diversity bonus (+2 for 4+ unique commenters)', () => {
			const fourCommentsFourAuthors: IssueCommentResponse = {
				comments: [
					{
						id: '1',
						author: { displayName: 'User A' },
					} as unknown as any,
					{
						id: '2',
						author: { displayName: 'User B' },
					} as unknown as any,
					{
						id: '3',
						author: { displayName: 'User C' },
					} as unknown as any,
					{
						id: '4',
						author: { displayName: 'User D' },
					} as unknown as any,
				],
				maxResults: 4,
				startAt: 0,
				total: 4,
			}

			const score = calculateCommunicationFrequencyScore(fourCommentsFourAuthors)

			// Base score for 4 comments is 6, +2 diversity bonus for 4+ unique commenters
			expect(score).toBe(8)
		})

		test('should calculate score for many comments (15+)', () => {
			// Create comments array with 15 comments from 5 different users
			const comments = Array(15)
				.fill(null)
				.map(
					(_, i) =>
						({
							id: String(i),
							author: { displayName: `User ${i % 5}` },
						}) as unknown as any,
				)

			const manyComments: IssueCommentResponse = {
				comments,
				maxResults: 15,
				startAt: 0,
				total: 15,
			}

			const score = calculateCommunicationFrequencyScore(manyComments)

			// Base score for 15+ comments is 10, with diversity bonus would be 12 but capped at 10
			expect(score).toBe(10)
		})

		test('should handle comments without author information', () => {
			const commentsWithoutAuthors: IssueCommentResponse = {
				comments: [
					{ id: '1' } as unknown as any,
					{ id: '2', author: null } as unknown as any,
					{ id: '3', author: {} as any } as unknown as any,
					{ id: '4', author: { displayName: 'User A' } as unknown as any } as unknown as any,
				],
				maxResults: 4,
				startAt: 0,
				total: 4,
			}

			const score = calculateCommunicationFrequencyScore(commentsWithoutAuthors)

			// Base score for 4 comments is 6, no diversity bonus (only 1 valid author)
			expect(score).toBe(6)
		})

		// This test covers specific comment count boundaries
		test('should calculate correct base scores for different comment counts', () => {
			const testCases = [
				{ count: 0, expectedBase: 3 },
				{ count: 1, expectedBase: 3 },
				{ count: 2, expectedBase: 4 },
				{ count: 3, expectedBase: 5 },
				{ count: 4, expectedBase: 6 },
				{ count: 6, expectedBase: 7 },
				{ count: 8, expectedBase: 8 },
				{ count: 10, expectedBase: 9 },
				{ count: 15, expectedBase: 10 },
			]

			testCases.forEach(({ count, expectedBase }) => {
				const comments: IssueCommentResponse = {
					comments: Array(count)
						.fill(null)
						.map(
							(_, i) =>
								({
									id: String(i),
									author: { displayName: 'Same User' },
								}) as unknown as any,
						),
					maxResults: count,
					startAt: 0,
					total: count,
				}

				// Since all comments are from the same user, there's no diversity bonus
				// so the score should match the expected base score
				expect(calculateCommunicationFrequencyScore(comments)).toBe(expectedBase)
			})
		})
	})
})
