/**
 * Core Jira issue analysis functionality
 *
 * This file implements the primary analysis logic for Jira issues, coordinating
 * various specialized analyzers to evaluate completeness, continuity, dependencies,
 * and other quality metrics to provide a comprehensive assessment.
 */

import { getCompletenessEvaluation } from './completenessEvaluation/getCompletenessEvaluation'
import { getComplexityAnalysis } from './complexityAnalysis/getComplexityAnalysis'
import { getContinuityAnalysis } from './continuityAnalysis/getContinuityAnalysis'
import { getDependenciesAnalysis } from './dependenciesAnalysis/getDependenciesAnalysis'
import { getDurationAssessment } from './durationAssessment/getDurationAssessment'
import { getMetadataAssessment } from './metadataAssessment/getMetadataAssessment'
import { getRiskIdentification } from './riskIdentification/getRiskIdentification'
import type { IssueAnalysisResult } from './analyzeIssue.types'
import type { IssueCommentResponse } from '../../types/comment'
import type { JiraIssue } from '../../types/issue.types'

export function analyzeIssue(issue: JiraIssue, commentsResponse: IssueCommentResponse): Partial<IssueAnalysisResult> {
	const metadataAssessment = getMetadataAssessment(issue, commentsResponse)
	const complexityAnalysis = getComplexityAnalysis(issue, commentsResponse)
	const completenessEvaluation = getCompletenessEvaluation(issue, commentsResponse)
	const dependenciesAnalysis = getDependenciesAnalysis(issue, commentsResponse)
	const durationAssessment = getDurationAssessment(issue, commentsResponse)
	const continuityAnalysis = getContinuityAnalysis(issue, commentsResponse)

	// Pass previous analysis results to risk identification for enhanced risk detection
	const riskIdentification = getRiskIdentification(issue, commentsResponse, {
		complexity: complexityAnalysis,
		dependencies: dependenciesAnalysis,
		duration: durationAssessment,
		completeness: completenessEvaluation,
		continuity: continuityAnalysis,
	})

	return {
		issueKey: issue.key,
		summary: issue.fields.summary,
		issueType: issue.fields.issuetype.name,
		metadata: metadataAssessment,
		complexity: complexityAnalysis,
		completeness: completenessEvaluation,
		dependencies: dependenciesAnalysis,
		duration: durationAssessment,
		continuity: continuityAnalysis,
		risks: riskIdentification,
	}
}
