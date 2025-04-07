/**
 * Comment Blocking Reason Extractor
 *
 * This utility analyzes issue comments to extract potential reasons for blockages.
 * It searches through comments made around the time an issue was blocked to identify
 * explanations for the impediment. The module parses different comment formats,
 * handles both simple text and structured content, and associates relevant comments
 * with specific blocked periods. This analysis helps teams understand why issues get
 * blocked and identify common patterns of impediments across their workflow.
 */
import { isRelevantComment } from './isRelevantComment'
import type { IssueComment, IssueCommentResponse } from '../../../../types/comment'
import type { BlockedPeriod } from '../types/durationAssessment.types'

/**
 * Extract reason from comment body based on its type
 */
function extractReasonFromBody(body: IssueComment['body']): string | null {
	if (typeof body === 'string') return body

	if (body && (Array.isArray(body) || typeof body === 'object')) {
		return 'Found in comment (complex format)'
	}

	return null
}

/**
 * Extracts potential blocking reasons from comments for a specific blocked period
 */
export function extractCommentBlockingReason(
	period: BlockedPeriod,
	commentsResponse: IssueCommentResponse | undefined,
): BlockedPeriod {
	if (!commentsResponse?.comments.length) {
		return period
	}

	const relevantComment = commentsResponse.comments.find(function (comment) {
		return isRelevantComment(comment, period.startTime)
	})

	if (!relevantComment) {
		return period
	}

	const extractedReason = extractReasonFromBody(relevantComment.body)

	return {
		...period,
		reason: extractedReason || period.reason,
	}
}
