/**
 * This file provides functionality to extract Jira issue keys mentioned in text content.
 * It uses regular expressions to identify the standardized format of Jira issue keys
 * (typically PROJECT-123) within text fields like descriptions and comments. The file
 * also includes utilities to extract and track explicitly linked issues, which is used
 * to differentiate between formally linked dependencies and those only mentioned in text.
 * These functions are fundamental to identifying implicit dependencies in issue content.
 */

import { ISSUE_KEY_PATTERN } from '../utils/patterns/issueKeyPatterns'
import type { JiraIssue, IssueLink } from '../../../../types/issue.types'

/**
 * Finds all Jira issue keys mentioned in text
 */
export function findMentionedIssueKeys(text: string): string[] {
	if (!text) {
		return []
	}

	// Use regex to find all issue keys in the text
	const matches = text.match(ISSUE_KEY_PATTERN) || []

	// Remove duplicates by converting to Set and back to array
	return Array.from(new Set(matches))
}

/**
 * Extracts explicitly linked issue keys from an issue
 */
export function extractExplicitlyLinkedKeys(issue: JiraIssue): Set<string> {
	const linkedKeys = new Set<string>()

	if (!issue?.fields?.issuelinks || !Array.isArray(issue.fields.issuelinks)) {
		return linkedKeys
	}

	issue.fields.issuelinks.forEach((link: IssueLink) => {
		if (link.inwardIssue) {
			linkedKeys.add(link.inwardIssue.key)
		}

		if (link.outwardIssue) {
			linkedKeys.add(link.outwardIssue.key)
		}
	})

	return linkedKeys
}
