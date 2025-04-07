/**
 * This file analyzes the technical complexity of Jira issues based on keywords found in descriptions
 * and comments. It searches for technical terms that typically indicate complex implementation requirements,
 * such as "performance", "scalability", "concurrency", etc. The presence of these indicators helps
 * assess the technical challenge level of an issue, which contributes to the overall complexity
 * assessment used for issue prioritization and resource planning.
 */
import { getComplexityKeywords } from './utils/complexityKeywords'
import { findKeywordsInIssue } from './utils/keywordDetection'
import { calculateComplexityScore, createComplexityFactor } from './utils/scoringUtils'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Analyzes technical complexity indicators in description and comments
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @returns Score and factor describing technical complexity
 */
export function analyzeTechnicalComplexity(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
): { score: number; factor: string | null } {
	const complexityKeywords = getComplexityKeywords()
	const keywordsFound = findKeywordsInIssue(issue, commentsResponse, complexityKeywords)
	const score = calculateComplexityScore(keywordsFound.length)
	const factor = createComplexityFactor(keywordsFound)

	return { score, factor }
}
