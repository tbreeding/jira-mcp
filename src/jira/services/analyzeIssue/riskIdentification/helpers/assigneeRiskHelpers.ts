/**
 * Helper functions for detecting assignee-related risks in Jira issues
 *
 * These functions analyze assignee patterns to identify potential knowledge concentration risks.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Detects knowledge concentration risks from assignee history
 *
 * @param issue - The Jira issue to analyze for assignee risks
 * @returns Risk description or null if no risk is found
 */
export function detectAssigneeConcentrationRisk(issue: JiraIssue): string | null {
	// Check if this issue was moved between multiple assignees
	// Jira API doesn't expose full history, but in some cases we can
	// check for history.histories with change to assignee field

	// Simplistic check for now - if issue has no assignee, it could be a risk
	if (!issue.fields.assignee) {
		return 'Issue not assigned to anyone, possibly due to knowledge requirements'
	}

	return null
}
