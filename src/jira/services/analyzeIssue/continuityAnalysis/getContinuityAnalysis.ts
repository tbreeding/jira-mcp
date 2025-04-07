/**
 * Core continuity analysis orchestration for Jira issues
 *
 * This file coordinates the various aspects of continuity analysis for Jira
 * issues, including flow efficiency, work fragmentation, momentum indicators,
 * and stagnation periods, assembling them into a comprehensive assessment.
 */

import { identifyCommunicationGaps } from './communicationGaps/identifyCommunicationGaps'
import { analyzeContextSwitches } from './contextSwitches/analyzeContextSwitches'
import { calculateFeedbackResponseTime } from './feedbackResponseTime/calculateFeedbackResponseTime'
import { calculateFlowEfficiency } from './flowEfficiency/calculateFlowEfficiency'
import { identifyLateStageChanges } from './lateStageChanges/identifyLateStageChanges'
import { analyzeMomentumIndicators } from './momentumIndicators/analyzeMomentumIndicators'
import { identifyStagnationPeriods } from './stagnationPeriods/identifyStagnationPeriods'
import { analyzeWorkFragmentation } from './workFragmentation/analyzeWorkFragmentation'
import type { ContinuityAnalysisResult } from './types/continuityAnalysis.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Analyzes the continuity of work on a Jira issue
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - The issue's comments
 * @returns Continuity analysis result
 */
export function getContinuityAnalysis(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
): ContinuityAnalysisResult {
	// Calculate flow efficiency
	const flowEfficiency = calculateFlowEfficiency(issue)

	// Identify stagnation periods
	const stagnationPeriods = identifyStagnationPeriods(issue)

	// Calculate longest stagnation period
	const longestStagnationPeriod =
		stagnationPeriods.length > 0 ? Math.max(...stagnationPeriods.map((period) => period.durationDays)) : 0

	// Identify communication gaps
	const communicationGaps = identifyCommunicationGaps(issue, commentsResponse)

	// Analyze context switches
	const contextSwitches = analyzeContextSwitches(issue)

	// Calculate momentum score
	const momentumScore = analyzeMomentumIndicators(issue, commentsResponse, stagnationPeriods)

	// Analyze work fragmentation
	const workFragmentation = analyzeWorkFragmentation(issue)

	// Identify late-stage changes
	const lateStageChanges = identifyLateStageChanges(issue)

	// Calculate feedback response time
	const feedbackResponseTime = calculateFeedbackResponseTime(commentsResponse)

	// Return the complete continuity analysis
	return {
		flowEfficiency,
		stagnationPeriods,
		longestStagnationPeriod,
		communicationGaps,
		contextSwitches,
		momentumScore,
		workFragmentation,
		lateStageChanges,
		feedbackResponseTime,
	}
}
