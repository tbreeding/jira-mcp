/**
 * Knowledge risk analysis for Jira issues
 *
 * This file provides functionality to identify risks related to knowledge concentration
 * and specialized technology usage, which could create team dependencies and impede progress.
 */

import { detectAssigneeConcentrationRisk } from './helpers/assigneeRiskHelpers'
import { processComplexityAnalysis } from './helpers/complexityRiskHelpers'
import {
	processKnowledgeConcentrationIndicators,
	processSpecializedTechnologyIndicators,
} from './helpers/knowledgeTextAnalysisHelpers'
import { KNOWLEDGE_PATTERNS, SPECIALIZED_TECH_PATTERNS } from './patterns/knowledgeRiskPatterns'
import { extractCommentsText } from './utils/commentTextExtraction'
import { detectRiskIndicators } from './utils/detectRiskIndicators'
import type { PreviousAnalysisResults, RiskCategoryResult } from './types/riskIdentification.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Analyzes an issue for knowledge-related risks
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @param previousResults - Previous analysis results if available
 * @returns Risk category result with score and identified risk items
 */
export function analyzeKnowledgeRisk(
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

	// Check for knowledge concentration indicators
	const knowledgeResult = detectRiskIndicators(
		// This check is needed because descriptionText might be an object (e.g., ADF content)
		// rather than a string, despite the || '' fallback
		typeof descriptionText === 'string' ? allText : `[object Object] ${commentsText}`,
		KNOWLEDGE_PATTERNS,
		'Knowledge Risk',
	)

	// Check for specialized technology indicators
	const techResult = detectRiskIndicators(
		typeof descriptionText === 'string' ? allText : `[object Object] ${commentsText}`,
		SPECIALIZED_TECH_PATTERNS,
		'Specialized Technology Risk',
	)

	// Process knowledge concentration indicators
	score += processKnowledgeConcentrationIndicators(knowledgeResult, riskItems, mitigationSuggestions)

	// Process specialized technology indicators
	score += processSpecializedTechnologyIndicators(techResult, riskItems, mitigationSuggestions)

	// Check for assignee concentration risk
	const assigneeRisk = detectAssigneeConcentrationRisk(issue)
	if (assigneeRisk) {
		riskItems.push(assigneeRisk)
		score += 2
	}

	// Use complexity analysis if available
	if (previousResults?.complexity) {
		score += processComplexityAnalysis(previousResults.complexity.level, riskItems, mitigationSuggestions)
	}

	// Ensure score is within 1-10 range
	score = Math.min(10, Math.max(1, score))

	return {
		score: Math.round(score),
		riskItems,
		mitigationSuggestions: [...new Set(mitigationSuggestions)], // Remove duplicates
	}
}
