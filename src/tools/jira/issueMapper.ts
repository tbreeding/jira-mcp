/**
 * Jira Issue Mapping Utilities
 *
 * This file contains utility functions for mapping Jira issues to simpler formats
 * to reduce payload size when returning issues to clients.
 */

import { extractSprints, getNamedProperty, extractParent } from './jiraFieldExtractors'

/**
 * Interface representing a Jira issue with essential fields only
 */
interface EssentialJiraIssue {
	id: string
	key: string
	summary: string
	status: string
	issueType: string
	priority: string
	assignee: string
	reporter: string
	created: string
	updated: string
	sprints: string[]
	parent?: {
		key: string
		summary: string
	}
}

/**
 * Maps a Jira issue to a reduced object containing only essential fields
 * @param issue The full Jira issue object
 * @returns A simplified issue object with only essential fields
 */
export function mapIssueToEssentialFields(issue: Record<string, unknown>): EssentialJiraIssue {
	const fields = (issue.fields as Record<string, unknown>) || {}
	const sprints = extractSprints(fields)
	const parent = extractParent(fields)
	return {
		id: issue.id as string,
		key: issue.key as string,
		summary: fields.summary as string,
		status: getNamedProperty(fields.status, 'name'),
		issueType: getNamedProperty(fields.issuetype, 'name'),
		priority: getNamedProperty(fields.priority, 'name'),
		assignee: getNamedProperty(fields.assignee, 'displayName'),
		reporter: getNamedProperty(fields.reporter, 'displayName'),
		created: fields.created as string,
		updated: fields.updated as string,
		sprints,
		...(parent && { parent }),
	}
}
