/**
 * Jira Project Type Definitions
 *
 * This file defines the type interfaces for Jira projects.
 * It provides the structure for project data retrieved from the Jira API.
 */

import type { JiraIssueType } from './issueType.types'

/**
 * Represents a Jira project
 */
export interface JiraProject {
	id: string
	key: string
	name: string
	projectTypeKey: string
	simplified: boolean
	style: string
	isPrivate: boolean
	properties?: Record<string, unknown>
	entityId?: string
	uuid?: string
	projectCategory?: {
		id: string
		name: string
		description?: string
	}
	description?: string
	url?: string
	email?: string
	assigneeType?: string
	avatarUrls?: Record<string, string>
	self?: string
}

/**
 * The response from the Jira API when retrieving projects
 */
export type JiraProjectsResponse = JiraProject[]
/**
 * Response shape from Jira API when retrieving a single project
 * Includes issue types associated with the project
 */
export interface JiraProjectResponse {
	id: string
	key: string
	name: string
	issueTypes?: JiraIssueType[]
}
