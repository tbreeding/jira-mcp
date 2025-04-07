/**
 * This file provides functionality to analyze comments on Jira issues to determine complexity factors.
 * It calculates metrics such as average comment length, determines if discussions are "deep" based on
 * comment length thresholds, and assigns a complexity score based on comment volume and depth.
 * This analysis contributes to the overall complexity assessment of Jira issues by factoring in
 * the amount and depth of discussion that took place during issue resolution.
 */
import type { IssueComment, IssueCommentResponse } from '../../../types/comment'

/**
 * Calculates the average length of comments
 */
function calculateAverageCommentLength(comments: IssueComment[]): number {
	if (comments.length === 0) {
		return 0
	}

	let totalCommentLength = 0
	comments.forEach(function (comment) {
		totalCommentLength += JSON.stringify(comment.body).length
	})

	return totalCommentLength / comments.length
}

/**
 * Determines if the discussion is considered deep based on average comment length
 */
function isDeepDiscussion(averageCommentLength: number): boolean {
	return averageCommentLength > 200 // Arbitrary threshold for "deep" discussion
}

/**
 * Calculates complexity score based on comment count and depth
 */
function calculateCommentScore(commentCount: number, hasDeepDiscussion: boolean): number {
	if (commentCount > 10 && hasDeepDiscussion) {
		return 3
	}

	if (commentCount > 5 || hasDeepDiscussion) {
		return 2
	}

	if (commentCount > 0) {
		return 1
	}

	return 0
}

/**
 * Creates a descriptive factor about the comment complexity
 */
function createCommentFactor(commentCount: number, hasDeepDiscussion: boolean): string | null {
	if (commentCount === 0) {
		return null
	}

	return `Discussion volume: ${commentCount} comments${hasDeepDiscussion ? ' with in-depth discussion' : ''}`
}

/**
 * Analyzes comment volume and discussion depth
 *
 * @param commentsResponse - Comments related to the issue
 * @returns Score and factor describing the complexity from comments
 */
export function analyzeComments(commentsResponse: IssueCommentResponse): { score: number; factor: string | null } {
	const commentCount = commentsResponse.comments.length
	const averageCommentLength = calculateAverageCommentLength(commentsResponse.comments)
	const hasDeepDiscussion = isDeepDiscussion(averageCommentLength)

	const score = calculateCommentScore(commentCount, hasDeepDiscussion)
	const factor = createCommentFactor(commentCount, hasDeepDiscussion)

	return { score, factor }
}
