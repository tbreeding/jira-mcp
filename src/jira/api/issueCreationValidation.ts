/**
 * Issue Creation Field Validation
 *
 * This module provides validation functions for Jira issue creation fields.
 * It ensures that required fields are present and correctly formatted before
 * the API request is sent to Jira.
 */

import type { CreateIssueFields } from './createIssue'

/**
 * Validates if the summary field is present and not empty
 */
function validateSummary(summary?: string): string | null {
	if (!summary || summary.trim() === '') {
		return 'Summary is required'
	}
	return null
}

/**
 * Validates if the project key is present and not empty
 */
function validateProject(project?: { key?: string }): string | null {
	if (!project || !project.key || project.key.trim() === '') {
		return 'Project key is required'
	}
	return null
}

/**
 * Validates if the issue type ID or name is present and not empty
 */
function validateIssueType(issuetype?: { id?: string; name?: string }): string | null {
	if (!issuetype) {
		return 'Issue type is required'
	}

	// Either id or name must be present
	if (!issuetype.id && !issuetype.name) {
		return 'Either issue type ID or name is required'
	}

	return null
}

/**
 * Function to validate required fields for issue creation
 * @param fields The issue fields to validate
 * @returns Error message string if validation fails, null if valid
 */
export function validateCreateIssueFields(fields: CreateIssueFields): string | null {
	// Validate required fields one by one
	const summaryError = validateSummary(fields.summary)
	if (summaryError) return summaryError

	const projectError = validateProject(fields.project)
	if (projectError) return projectError

	const issueTypeError = validateIssueType(fields.issuetype)
	if (issueTypeError) return issueTypeError

	return null
}
