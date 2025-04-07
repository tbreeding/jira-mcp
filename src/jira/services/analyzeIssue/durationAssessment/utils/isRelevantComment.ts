/**
 * Comment Relevance Detector
 *
 * This utility determines whether an issue comment is relevant to a specific blocked period.
 * It analyzes the timestamp of comments relative to when an issue became blocked to identify
 * comments that might explain the blockage. The module implements time-based relevance rules,
 * considering comments made shortly before or after a blocking event as potentially explanatory.
 * This temporal analysis helps associate the right comments with blocked periods for more
 * accurate and insightful blocked time analytics.
 */
import type { IssueComment } from '../../../../types/comment'

/**
 * Determines if a comment is relevant to a blocked period
 * (posted within 24 hours before or after the block started)
 * @param comment The comment to check
 * @param blockStartTime The timestamp when the block started
 * @returns True if the comment is relevant to the blocked period
 */
export function isRelevantComment(comment: IssueComment, blockStartTime: string): boolean {
	const commentDate = new Date(comment.created)
	const blockStartDate = new Date(blockStartTime)

	// Look for comments within 24 hours before or after the block started
	const timeDiff = Math.abs(commentDate.getTime() - blockStartDate.getTime())
	const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

	return timeDiff < ONE_DAY_IN_MS
}
