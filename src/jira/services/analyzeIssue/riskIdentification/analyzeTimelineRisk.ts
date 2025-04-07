/**
 * Timeline risk analysis for Jira issues
 *
 * This file provides functionality to identify timeline-related risks in Jira issues,
 * such as tight deadlines, sprint boundary issues, and unrealistic estimations.
 */

import { processDurationData } from './helpers/processDurationData'
import {
	processTimelineConstraintIndicators,
	processEstimationConcernIndicators,
} from './helpers/timelineTextAnalysisHelpers'
import { TIMELINE_PATTERNS, ESTIMATION_PATTERNS } from './patterns/timelineRiskPatterns'
import { detectRiskIndicators } from './utils/detectRiskIndicators'
import type { PreviousAnalysisResults, RiskCategoryResult } from './types/riskIdentification.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Analyzes an issue for timeline-related risks
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @param previousResults - Previous analysis results if available
 * @returns Risk category result with score and identified risk items
 */
export function analyzeTimelineRisk(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
	previousResults?: PreviousAnalysisResults,
): RiskCategoryResult {
	// Get all relevant text
	const descriptionText = issue.fields.description || ''
	const commentsText = commentsResponse.comments.map((comment) => comment.body || '').join(' ')
	const allText = `${descriptionText} ${commentsText}`

	// Default results
	const riskItems: string[] = []
	const mitigationSuggestions: string[] = []
	let score = 1 // Base risk score

	// Check for timeline risk indicators in text
	const timelineResult = detectRiskIndicators(allText, TIMELINE_PATTERNS, 'Timeline Risk')

	// Check for estimation risk indicators in text
	const estimationResult = detectRiskIndicators(allText, ESTIMATION_PATTERNS, 'Estimation Risk')

	// Process timeline constraint indicators
	score += processTimelineConstraintIndicators(timelineResult, riskItems, mitigationSuggestions)

	// Process estimation concern indicators
	score += processEstimationConcernIndicators(estimationResult, riskItems, mitigationSuggestions)

	// Process previous duration assessment data if available
	if (previousResults?.duration) {
		score += processDurationData(previousResults.duration, riskItems, mitigationSuggestions)
	}

	// Ensure score is within 1-10 range
	score = Math.min(10, Math.max(1, score))

	return {
		score: Math.round(score),
		riskItems,
		mitigationSuggestions: [...new Set(mitigationSuggestions)], // Remove duplicates
	}
}
