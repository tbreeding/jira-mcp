/**
 * Jira Issue Type Definitions
 *
 * This file defines the type interfaces for Jira issue types.
 * It provides the structure for issue type data retrieved from the Jira API.
 */

/**
 * Represents a Jira issue type
 */
export interface JiraIssueType {
	id: string
	name: string
	description: string
	iconUrl: string
	subtask: boolean
	avatarId?: number
	entityId?: string
	hierarchyLevel?: number
	scope?: {
		type: string
		project?: {
			id: string
			key: string
			name: string
		}
	}
	self?: string
}

/**
 * The response from the Jira API when retrieving issue types for a project
 */
export interface JiraIssueTypesResponse {
	issueTypes: JiraIssueType[]
}
