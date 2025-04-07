/**
 * Main Risk Identification Module for Jira Issues
 *
 * This file provides the main orchestration functionality for risk identification.
 * It aggregates risks from various categories including technical debt, dependencies,
 * timeline constraints, knowledge concentration, and information quality.
 */

import { analyzeDependencyRisk } from './analyzeDependencyRisk'
import { analyzeInformationRisk } from './analyzeInformationRisk'
import { analyzeKnowledgeRisk } from './analyzeKnowledgeRisk'
import { analyzeTechnicalRisk } from './analyzeTechnicalRisk'
import { analyzeTimelineRisk } from './analyzeTimelineRisk'
import { calculateRiskScore } from './utils/calculateRiskScore'
import { generateMitigationSuggestions } from './utils/generateMitigationSuggestions'
import type { PreviousAnalysisResults, RiskIdentification } from './types/riskIdentification.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Identifies risks in a Jira issue by analyzing various risk categories
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @param previousResults - Optional previous analysis results for enhanced risk detection
 * @returns Risk identification with overall score, identified risks, and mitigation suggestions
 */
export function getRiskIdentification(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
	previousResults?: PreviousAnalysisResults,
): RiskIdentification {
	// Analyze different risk categories
	const technicalRiskResult = analyzeTechnicalRisk(issue, commentsResponse)
	const dependencyRiskResult = analyzeDependencyRisk(issue, commentsResponse, previousResults)
	const timelineRiskResult = analyzeTimelineRisk(issue, commentsResponse, previousResults)
	const knowledgeRiskResult = analyzeKnowledgeRisk(issue, commentsResponse, previousResults)
	const informationRiskResult = analyzeInformationRisk(issue, commentsResponse, previousResults)

	// Calculate overall risk score from category scores
	const score = calculateRiskScore(
		technicalRiskResult.score,
		dependencyRiskResult.score,
		timelineRiskResult.score,
		knowledgeRiskResult.score,
		informationRiskResult.score,
	)

	// Combine all risk items from different categories
	const allRiskItems = [
		...technicalRiskResult.riskItems,
		...dependencyRiskResult.riskItems,
		...timelineRiskResult.riskItems,
		...knowledgeRiskResult.riskItems,
		...informationRiskResult.riskItems,
	]

	// Generate consolidated mitigation suggestions
	// First collect all from individual analyzers
	const allSuggestions = [
		...technicalRiskResult.mitigationSuggestions,
		...dependencyRiskResult.mitigationSuggestions,
		...timelineRiskResult.mitigationSuggestions,
		...knowledgeRiskResult.mitigationSuggestions,
		...informationRiskResult.mitigationSuggestions,
	]

	// Then filter to remove duplicates
	const uniqueSuggestions = [...new Set(allSuggestions)]

	// Generate additional suggestions based on all risk items
	const additionalSuggestions = generateMitigationSuggestions(allRiskItems)

	// Combine all suggestions and keep unique ones
	const mitigationSuggestions = [...new Set([...uniqueSuggestions, ...additionalSuggestions])]

	return {
		score,
		items: allRiskItems,
		mitigationSuggestions,
	}
}
