/**
 * Blocking Reasons Extractor
 *
 * This module extracts and analyzes reasons why issues become blocked during their lifecycle.
 * It processes comments, status changes, and other metadata to identify explicit and implicit
 * blocking causes. The extracted information helps teams understand common impediments,
 * recognize patterns in workflow disruptions, and implement preventative measures to reduce
 * similar blockages in the future, ultimately improving process efficiency and predictability.
 */
import { extractCommentBlockingReason } from './utils/extractCommentBlockingReason'
import type { BlockedPeriod } from './types/durationAssessment.types'
import type { IssueCommentResponse } from '../../../types/comment'

/**
 * Extracts potential blocking reasons from comments
 * @param blockedPeriods Array of blocked periods
 * @param commentsResponse Comments on the issue
 * @returns Updated blocked periods with reasons
 */
export function extractBlockingReasons(
	blockedPeriods: BlockedPeriod[],
	commentsResponse: IssueCommentResponse,
): BlockedPeriod[] {
	if (commentsResponse.comments.length === 0 || blockedPeriods.length === 0) {
		return blockedPeriods
	}

	return blockedPeriods.map((period) => extractCommentBlockingReason(period, commentsResponse))
}
