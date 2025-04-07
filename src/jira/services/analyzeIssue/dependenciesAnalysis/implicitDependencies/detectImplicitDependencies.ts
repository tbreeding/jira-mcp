/**
 * This file provides functionality to detect implicit dependencies in Jira issues.
 * Implicit dependencies are issue relationships that are mentioned in text but not formally
 * linked in the Jira system. The module analyzes issue descriptions and comments to identify
 * mentioned issue keys and evaluates whether they represent dependencies based on contextual
 * language. By surfacing these hidden dependencies, the system helps teams understand the
 * full dependency graph even when formal issue linking is incomplete or inconsistent.
 */

import { extractTextFromComments } from '../utils/text/extractTextFromComments'
import { extractTextFromDescription } from '../utils/text/extractTextFromDescription'
import { findMentionedIssueKeys } from './findMentionedIssueKeys'
import { isDependencyRelated } from './isDependencyRelated'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Extracts keys from explicitly linked issues to avoid duplication
 */
export function extractExplicitlyLinkedKeys(issue: JiraIssue): Set<string> {
	const linkedKeys = new Set<string>()

	if (!issue?.fields?.issuelinks || !Array.isArray(issue.fields.issuelinks)) {
		return linkedKeys
	}

	issue.fields.issuelinks.forEach((link) => {
		if (link.inwardIssue) {
			linkedKeys.add(link.inwardIssue.key)
		}
		if (link.outwardIssue) {
			linkedKeys.add(link.outwardIssue.key)
		}
	})

	return linkedKeys
}

/**
 * Detects implicit dependencies mentioned in issue description or comments
 */
export function detectImplicitDependencies(issue: JiraIssue, commentsResponse: IssueCommentResponse): string[] {
	if (!issue || !commentsResponse) {
		return []
	}

	const descriptionText = extractTextFromDescription(issue)
	const commentsText = extractTextFromComments(commentsResponse)
	const allText = `${descriptionText} ${commentsText}`

	// Find issue keys mentioned in text
	const mentionedKeys = findMentionedIssueKeys(allText)

	// Extract explicitly linked issue keys to avoid duplication
	const explicitlyLinkedKeys = extractExplicitlyLinkedKeys(issue)

	// Filter for implicit dependencies by checking context for dependency phrases
	const implicitDependencies = new Set<string>()
	const allTextLowercase = allText.toLowerCase()

	// Check each mentioned key
	mentionedKeys.forEach((key) => {
		// Skip if this key is already explicitly linked
		if (explicitlyLinkedKeys.has(key)) {
			return
		}

		// Check if any dependency phrase is near this key
		if (isDependencyRelated(allTextLowercase, key.toLowerCase())) {
			implicitDependencies.add(key)
		}
	})

	return Array.from(implicitDependencies)
}
