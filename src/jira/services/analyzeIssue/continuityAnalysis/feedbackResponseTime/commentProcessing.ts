/**
 * Comment processing utilities for feedback analysis
 *
 * This file contains functions for processing and analyzing Jira comments
 * to identify questions, responses, and other communication patterns.
 * It supports the calculation of feedback response times and communication quality.
 */

import { processQuestionComment } from './questionProcessing'
import type { JiraComment } from './types'
import type { QuestionResponsePair } from '../../continuityAnalysis/types/continuityAnalysis.types'

/**
 * Processes sorted comments to find question-response pairs
 *
 * @param sortedComments - Chronologically sorted comments
 * @returns Array of question-response pairs
 */
export function processComments(sortedComments: JiraComment[]): QuestionResponsePair[] {
	const pairs: QuestionResponsePair[] = []
	const authorLastComment: Record<string, number> = {}

	// Find questions in comments
	for (let i = 0; i < sortedComments.length; i++) {
		const comment = sortedComments[i]

		// Skip if no body or author
		if (!comment.body || !comment.author?.displayName) {
			continue
		}

		// Update this author's last comment index
		authorLastComment[comment.author.displayName] = i

		// Process potential question comment
		const questionPair = processQuestionComment(comment, sortedComments.slice(i + 1))
		if (questionPair) {
			pairs.push(questionPair)
		}
	}

	return pairs
}
