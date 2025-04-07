/**
 * This file implements the central orchestration logic for identifying external dependencies in Jira issues.
 * It coordinates the extraction of text from various sources (description, comments) and delegates
 * to specialized extractors for different types of dependencies (system, team, approval). The file
 * brings together all external dependency detection mechanisms into a unified workflow, categorizes
 * the identified dependencies appropriately, and returns a comprehensive list of all external factors
 * that may influence the issue's progress or resolution timeline.
 */

import { extractTextFromComments } from '../utils/text/extractTextFromComments'
import { extractTextFromDescription } from '../utils/text/extractTextFromDescription'
import { findApprovalDependencies } from './extractors/findApprovalDependencies'
import { findExternalSystems } from './extractors/findExternalSystems'
import { findTeamDependencies } from './extractors/findTeamDependencies'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Identifies external dependencies from issue description and comments
 */
export function identifyExternalDependencies(issue: JiraIssue, commentsResponse: IssueCommentResponse): string[] {
	if (!issue || !commentsResponse) {
		return []
	}

	const descriptionText = extractTextFromDescription(issue)
	const commentsText = extractTextFromComments(commentsResponse)
	const allText = `${descriptionText} ${commentsText}`

	return collectAllExternalDependencies(allText)
}

/**
 * Collects all types of external dependencies from text
 */
export function collectAllExternalDependencies(text: string): string[] {
	if (!text) {
		return []
	}

	const externalDependencies = new Set<string>()

	// Find external system dependencies
	findExternalSystems(text).forEach((system) => {
		externalDependencies.add(`System: ${system}`)
	})

	// Find team dependencies
	findTeamDependencies(text).forEach((team) => {
		externalDependencies.add(`Team: ${team}`)
	})

	// Find approval dependencies
	findApprovalDependencies(text).forEach((approval) => {
		externalDependencies.add(`Approval: ${approval}`)
	})

	return Array.from(externalDependencies)
}
