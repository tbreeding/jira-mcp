/**
 * Metadata Assessment Module
 *
 * This module serves as the main entry point for metadata quality analysis of Jira issues.
 * It orchestrates the evaluation of multiple metadata aspects, including issue type accuracy,
 * summary quality, priority alignment, labeling completeness, and assignment stability.
 * The consolidated assessment provides a holistic view of issue quality beyond content alone,
 * helping teams identify process improvements and enforce documentation standards.
 * Better metadata leads to improved searchability, reporting accuracy, and workflow automation.
 */
import { countAssignmentChanges } from './countAssignmentChanges'
import { evaluateIssueType } from './evaluateIssueType'
import { evaluateLabelsAndComponents } from './evaluateLabelsAndComponents'
import { evaluatePriorityAlignment } from './evaluatePriorityAlignment'
import { evaluateSummaryQuality } from './evaluateSummaryQuality'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Assesses the metadata quality of a Jira issue
 * @param issue The Jira issue to analyze
 * @param commentsResponse The comments associated with the issue
 * @returns An object containing metadata assessment results
 */
export function getMetadataAssessment(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
): {
	issueType: string
	summary: string
	priorityAppropriate: boolean
	labelsAndComponentsAppropriate: boolean
	assignmentChanges: number
} {
	// Get issue type evaluation
	const issueType = evaluateIssueType(issue, commentsResponse)

	// Get summary quality
	const summary = evaluateSummaryQuality(issue)

	// Check priority alignment
	const priorityAppropriate = evaluatePriorityAlignment(issue, commentsResponse)

	// Evaluate labels and components
	const labelsAndComponentsAppropriate = evaluateLabelsAndComponents(issue)

	// Count assignment changes
	const assignmentChanges = countAssignmentChanges(issue)

	return {
		issueType,
		summary,
		priorityAppropriate,
		labelsAndComponentsAppropriate,
		assignmentChanges,
	}
}
