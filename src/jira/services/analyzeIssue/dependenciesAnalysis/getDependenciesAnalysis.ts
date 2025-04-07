/**
 * Dependency Analysis Module for Jira Issues
 *
 * This file provides functionality to analyze various dependencies of a Jira issue.
 * It identifies and categorizes different types of dependencies including blockers,
 * related issues, implicit dependencies, and external dependencies. The analysis
 * helps in understanding the complexity and interconnections of issues within a project.
 * The dependency analysis is critical for project planning and risk assessment.
 */
import { extractBlockers } from './explicitDependencies/extractBlockers'
import { extractRelatedIssues } from './explicitDependencies/extractRelatedIssues'
import { identifyExternalDependencies } from './externalDependencies/identifyExternalDependencies'
import { detectImplicitDependencies } from './implicitDependencies/detectImplicitDependencies'
import type { Dependencies } from './types/dependencies.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Main function to analyze dependencies of a Jira issue
 */
export function getDependenciesAnalysis(issue: JiraIssue, commentsResponse: IssueCommentResponse): Dependencies {
	if (!issue || !commentsResponse) {
		return {
			blockers: [],
			relatedIssues: [],
			implicitDependencies: [],
			externalDependencies: [],
		}
	}

	const blockers = extractBlockers(issue)
	const relatedIssues = extractRelatedIssues(issue)
	const implicitDependencies = detectImplicitDependencies(issue, commentsResponse)
	const externalDependencies = identifyExternalDependencies(issue, commentsResponse)

	return {
		blockers,
		relatedIssues,
		implicitDependencies,
		externalDependencies,
	}
}
