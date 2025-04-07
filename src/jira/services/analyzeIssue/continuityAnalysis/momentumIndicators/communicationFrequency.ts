/**
 * Communication Frequency Analyzer
 *
 * This module measures the communication frequency and quality on Jira issues.
 * It evaluates comment frequency, volume, and participant diversity to generate a score.
 * The scoring system considers both raw comment quantity and participant diversity,
 * resulting in a holistic assessment of communication effectiveness.
 * Higher scores indicate robust discussion patterns that typically correlate with
 * better issue understanding, collaboration, and more effective resolution processes.
 */

import { calculateBaseCommentScore } from './calculateBaseCommentScore'
import { calculateCommenterDiversityBonus } from './calculateCommenterDiversityBonus'
import type { IssueCommentResponse } from '../../../../types/comment'

/**
 * Calculates a score for communication frequency
 *
 * @param commentsResponse - The issue's comments
 * @returns Communication frequency score (1-10)
 */
export function calculateCommunicationFrequencyScore(commentsResponse: IssueCommentResponse): number {
	// If no comments, return low score
	if (!commentsResponse || !commentsResponse.comments || commentsResponse.comments.length === 0) {
		return 3
	}

	// Base score on number of comments
	const commentCount = commentsResponse.comments.length
	const baseScore = calculateBaseCommentScore(commentCount)

	// Calculate bonus for diverse participants
	const diversityBonus = calculateCommenterDiversityBonus(commentsResponse.comments)

	// Apply bonus without exceeding maximum score
	return Math.min(10, baseScore + diversityBonus)
}
