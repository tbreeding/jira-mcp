/**
 * Technical risk analysis for Jira issues
 *
 * This file provides functionality to identify technical risks in Jira issues,
 * including technical debt, architectural impact, performance concerns, and security issues.
 */

import { enhanceRiskItems } from './helpers/technicalRiskEnhancement'
import { generateTechnicalMitigationSuggestions } from './helpers/technicalRiskMitigation'
import { calculateTechnicalRiskScore } from './helpers/technicalRiskScoring'
import {
	ARCHITECTURE_PATTERNS,
	PERFORMANCE_PATTERNS,
	SECURITY_PATTERNS,
	TECHNICAL_DEBT_PATTERNS,
} from './patterns/technicalRiskPatterns'
import { detectRiskIndicators } from './utils/detectRiskIndicators'
import type { RiskCategoryResult } from './types/riskIdentification.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Analyzes text to find technical risk indicators and score them
 */
function analyzeTechnicalRiskIndicators(allText: string): {
	technicalDebtResult: ReturnType<typeof detectRiskIndicators>
	architectureResult: ReturnType<typeof detectRiskIndicators>
	performanceResult: ReturnType<typeof detectRiskIndicators>
	securityResult: ReturnType<typeof detectRiskIndicators>
} {
	// Detect technical debt indicators
	const technicalDebtResult = detectRiskIndicators(allText, TECHNICAL_DEBT_PATTERNS, 'Technical Debt Risk')

	// Detect architecture impact indicators
	const architectureResult = detectRiskIndicators(allText, ARCHITECTURE_PATTERNS, 'Architecture Impact Risk')

	// Detect performance concerns
	const performanceResult = detectRiskIndicators(allText, PERFORMANCE_PATTERNS, 'Performance Risk')

	// Detect security issues
	const securityResult = detectRiskIndicators(allText, SECURITY_PATTERNS, 'Security Risk')

	return {
		technicalDebtResult,
		architectureResult,
		performanceResult,
		securityResult,
	}
}

/**
 * Analyzes an issue for technical risks by examining description and comments
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @returns Risk category result with score and identified risk items
 */
export function analyzeTechnicalRisk(issue: JiraIssue, commentsResponse: IssueCommentResponse): RiskCategoryResult {
	// Extract text from issue description
	const descriptionText = issue.fields.description || ''

	// Extract text from comments
	const commentsText = commentsResponse.comments.map((comment) => comment.body || '').join(' ')

	// Combine all text for analysis
	const allText = `${descriptionText} ${commentsText}`

	// Analyze for technical risk indicators
	const { technicalDebtResult, architectureResult, performanceResult, securityResult } =
		analyzeTechnicalRiskIndicators(allText)

	// Combine all detected risk indicators
	const riskItems = [
		...technicalDebtResult.indicators,
		...architectureResult.indicators,
		...performanceResult.indicators,
		...securityResult.indicators,
	]

	// Generate specific technical risk statements
	const enhancedRiskItems = enhanceRiskItems(riskItems)

	// Calculate a technical risk score (1-10)
	const score = calculateTechnicalRiskScore(technicalDebtResult, architectureResult, performanceResult, securityResult)

	// Generate appropriate mitigation suggestions
	const mitigationSuggestions = generateTechnicalMitigationSuggestions(
		technicalDebtResult,
		architectureResult,
		performanceResult,
		securityResult,
	)

	return {
		score,
		riskItems: enhancedRiskItems,
		mitigationSuggestions,
	}
}
