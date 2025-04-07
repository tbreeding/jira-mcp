/**
 * Dependency risk analysis for Jira issues
 *
 * This file provides functionality to identify dependency-related risks in Jira issues,
 * including external dependencies, cross-team coordination needs, and blocking dependencies.
 */

import { analyzePreviousDependencies } from './helpers/dependencyRisk/analyzePreviousDependencies'
import { analyzeTextDependencies } from './helpers/dependencyRisk/analyzeTextDependencies'
import { extractTextForAnalysis } from './helpers/dependencyRisk/extractTextForAnalysis'
import type { PreviousAnalysisResults, RiskCategoryResult } from './types/riskIdentification.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Analyzes an issue for dependency risks
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @param previousResults - Previous analysis results if available
 * @returns Risk category result with score and identified risk items
 */
export function analyzeDependencyRisk(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
	previousResults?: PreviousAnalysisResults,
): RiskCategoryResult {
	// Extract text for analysis
	const text = extractTextForAnalysis(issue, commentsResponse)

	// Analyze the text for dependency risks
	const textAnalysis = analyzeTextDependencies(text)

	// Analyze previous dependency data if available
	const previousAnalysis = analyzePreviousDependencies(previousResults?.dependencies)

	// Combine results
	const riskItems = [...textAnalysis.riskItems, ...previousAnalysis.riskItems]
	const mitigationSuggestions = [...textAnalysis.mitigationSuggestions, ...previousAnalysis.mitigationSuggestions]

	// Calculate total score (base score of 1 plus increases from analyses)
	let score = 1 + textAnalysis.scoreIncrease + previousAnalysis.scoreIncrease

	// Ensure score is within 1-10 range
	score = Math.min(10, Math.max(1, score))

	return {
		score: Math.round(score),
		riskItems,
		mitigationSuggestions: [...new Set(mitigationSuggestions)], // Remove duplicates
	}
}
