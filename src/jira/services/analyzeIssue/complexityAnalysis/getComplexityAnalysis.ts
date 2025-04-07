/**
 * This file serves as the main entry point for complexity analysis of Jira issues.
 * It orchestrates multiple complexity analyzers to evaluate different aspects of an issue's complexity,
 * including technical complexity, linked issues, comments, assignee changes, estimation changes,
 * field modifications, and component touchpoints. The results are aggregated into a normalized
 * complexity score (1-10) and categorized into complexity levels from trivial to very complex.
 */
import { analyzeComments } from './analyzeComments'
import { analyzeComponentTouchpoints } from './analyzeComponentTouchpoints'
import { analyzeEstimationChanges } from './analyzeEstimationChanges'
import { analyzeFieldModifications } from './analyzeFieldModifications'
import { analyzeLinkedIssues } from './analyzeLinkedIssues'
import { analyzeTechnicalComplexity } from './analyzeTechnicalComplexity'
import { countAssigneeChanges } from './countAssigneeChanges'
import { determineComplexityLevel } from './determineComplexityLevel'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Represents a complexity factor analysis result
 */
interface ComplexityFactor {
	score: number
	factor: string | null
}

/**
 * Adds a complexity factor to the total score and factors list
 */
function processComplexityFactor(factor: ComplexityFactor, totalScore: number, factorsList: string[]): number {
	if (factor.factor) {
		factorsList.push(factor.factor)
	}
	return totalScore + factor.score
}

/**
 * Normalizes a score to a 1-10 scale
 */
function normalizeScore(score: number): number {
	return Math.min(Math.max(Math.round(score), 1), 10)
}

/**
 * Analyzes the complexity of a Jira issue based on multiple factors
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @returns Complexity analysis with score, factors, and complexity level
 */
export function getComplexityAnalysis(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
): {
	score: number
	factors: string[]
	level: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very complex'
} {
	const factors: string[] = []
	let complexityScore = 0

	// Analyze all complexity factors
	complexityScore = processComplexityFactor(
		analyzeTechnicalComplexity(issue, commentsResponse),
		complexityScore,
		factors,
	)

	complexityScore = processComplexityFactor(analyzeLinkedIssues(issue), complexityScore, factors)

	complexityScore = processComplexityFactor(analyzeComments(commentsResponse), complexityScore, factors)

	complexityScore = processComplexityFactor(countAssigneeChanges(issue), complexityScore, factors)

	complexityScore = processComplexityFactor(analyzeEstimationChanges(issue), complexityScore, factors)

	complexityScore = processComplexityFactor(analyzeFieldModifications(issue), complexityScore, factors)

	complexityScore = processComplexityFactor(analyzeComponentTouchpoints(issue), complexityScore, factors)

	// Normalize score and determine complexity level
	const normalizedScore = normalizeScore(complexityScore)
	const level = determineComplexityLevel(normalizedScore)

	return {
		score: normalizedScore,
		factors,
		level,
	}
}
