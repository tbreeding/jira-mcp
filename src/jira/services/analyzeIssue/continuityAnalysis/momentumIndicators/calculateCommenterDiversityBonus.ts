/**
 * Commenter diversity analysis for momentum assessment
 *
 * This file implements algorithms for analyzing the diversity of commenters
 * on a Jira issue and calculating associated momentum bonuses, recognizing
 * that broader team engagement often correlates with better issue progression.
 */

import type { IssueCommentResponse } from '../../../../types/comment'

/**
 * Calculates bonus points for diverse commenters
 *
 * @param comments - Array of comments on the issue
 * @returns Bonus points for commenter diversity
 */
export function calculateCommenterDiversityBonus(comments: IssueCommentResponse['comments']): number {
	// Count unique commenters
	const uniqueCommenters = new Set()
	comments.forEach((comment) => {
		if (comment.author?.displayName) {
			uniqueCommenters.add(comment.author.displayName)
		}
	})

	// Award bonus based on number of unique commenters
	if (uniqueCommenters.size >= 4) {
		return 2 // Bonus for 4+ unique commenters
	} else if (uniqueCommenters.size >= 3) {
		return 1 // Bonus for 3 unique commenters
	}

	return 0
}
