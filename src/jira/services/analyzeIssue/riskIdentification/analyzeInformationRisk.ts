/**
 * Information risk analysis for Jira issues
 *
 * This file provides functionality to identify risks related to information quality
 * in Jira issues, such as missing requirements, ambiguities, and gaps in specifications.
 */

import {
	processRequirementsGapIndicators,
	processAmbiguityIndicators,
	checkForMissingDescription,
} from './helpers/informationRiskHelpers'
import { processCompletenessEvaluation } from './helpers/processCompletenessEvaluation'
import { REQUIREMENTS_PATTERNS, AMBIGUITY_PATTERNS } from './patterns/informationRiskPatterns'
import { extractCommentsText } from './utils/commentTextExtraction'
import { detectRiskIndicators } from './utils/detectRiskIndicators'
import type { PreviousAnalysisResults, RiskCategoryResult } from './types/riskIdentification.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Analyzes an issue for information-related risks
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @param previousResults - Previous analysis results if available
 * @returns Risk category result with score and identified risk items
 */
export function analyzeInformationRisk(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
	previousResults?: PreviousAnalysisResults,
): RiskCategoryResult {
	// Get all relevant text
	const descriptionText = issue.fields.description || ''
	const commentsText = extractCommentsText(commentsResponse)
	const allText = `${descriptionText} ${commentsText}`

	// Default results
	const riskItems: string[] = []
	const mitigationSuggestions: string[] = []
	let score = 1 // Base risk score

	// Check for requirements gaps in text
	const requirementsResult = detectRiskIndicators(allText, REQUIREMENTS_PATTERNS, 'Requirements Gap Risk')

	// Check for ambiguities in text
	const ambiguityResult = detectRiskIndicators(allText, AMBIGUITY_PATTERNS, 'Ambiguity Risk')

	// Process requirements gap indicators
	score += processRequirementsGapIndicators(requirementsResult, riskItems, mitigationSuggestions)

	// Process ambiguity indicators
	score += processAmbiguityIndicators(ambiguityResult, riskItems, mitigationSuggestions)

	// Use completeness evaluation if available
	if (previousResults?.completeness) {
		score += processCompletenessEvaluation(previousResults.completeness, riskItems, mitigationSuggestions)
	}

	// If no description at all, that's a major risk
	// This check is needed because descriptionText might be an object (e.g., ADF content)
	// rather than a string, despite the || '' fallback
	score += checkForMissingDescription(
		typeof descriptionText === 'string' ? descriptionText : '',
		riskItems,
		mitigationSuggestions,
	)

	// Ensure score is within 1-10 range
	score = Math.min(10, Math.max(1, score))

	return {
		score: Math.round(score),
		riskItems,
		mitigationSuggestions: [...new Set(mitigationSuggestions)], // Remove duplicates
	}
}
