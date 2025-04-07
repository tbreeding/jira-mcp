/**
 * Momentum indicators analysis for Jira issue progression
 *
 * This file implements the core functionality for analyzing issue momentum,
 * measuring the consistency and pace of progress through various indicators
 * such as update frequency, stagnation periods, and work consistency.
 */

import { calculateCommunicationFrequencyScore } from './communicationFrequency'
import { calculateContextSwitchingScore } from './contextSwitching'
import { calculateProgressConsistencyScore } from './progressConsistency'
import { calculateStagnationImpactScore } from './stagnationImpact'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'
import type { StagnationPeriod } from '../types/continuityAnalysis.types'

/**
 * Default weights for momentum factors
 */
const MOMENTUM_FACTOR_WEIGHTS = {
	progressConsistency: 0.35, // Weight for consistent progress over time
	communicationFrequency: 0.25, // Weight for regular communication
	stagnationImpact: 0.3, // Weight for lack of stagnation periods
	contextSwitches: 0.1, // Weight for minimal team handoffs
}

/**
 * Analyzes momentum indicators and provides a score
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - The issue's comments
 * @param stagnationPeriods - Previously calculated stagnation periods
 * @returns Momentum score (1-10 scale)
 */
export function analyzeMomentumIndicators(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
	stagnationPeriods: StagnationPeriod[],
): number {
	// Calculate progress consistency (how regularly the issue was updated)
	const progressConsistencyScore = calculateProgressConsistencyScore(issue)

	// Calculate communication frequency score
	const communicationFrequencyScore = calculateCommunicationFrequencyScore(commentsResponse)

	// Calculate stagnation impact score (inversely related to stagnation)
	const stagnationImpactScore = calculateStagnationImpactScore(stagnationPeriods)

	// Calculate context switching score
	const contextSwitchingScore = calculateContextSwitchingScore(issue)

	// Calculate weighted average for final score
	const momentumScore =
		progressConsistencyScore * MOMENTUM_FACTOR_WEIGHTS.progressConsistency +
		communicationFrequencyScore * MOMENTUM_FACTOR_WEIGHTS.communicationFrequency +
		stagnationImpactScore * MOMENTUM_FACTOR_WEIGHTS.stagnationImpact +
		contextSwitchingScore * MOMENTUM_FACTOR_WEIGHTS.contextSwitches

	// Normalize to 1-10 scale and round to nearest integer
	return Math.round(momentumScore)
}
