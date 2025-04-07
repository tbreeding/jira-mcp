/**
 * Jira issue type by ID retrieval functionality
 *
 * This file implements the function to fetch a specific issue type by ID.
 */

import { Failure, Success } from '../../utils/try'
import { getIssueTypes } from './getIssueTypesFunction'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'
import type { JiraIssueType } from '../types/issueType.types'

/**
 * Retrieves a specific issue type by ID for a project
 * @param projectKey The key of the project the issue type belongs to
 * @param issueTypeId The ID of the issue type to retrieve
 * @param config Jira API configuration
 * @returns A Result object containing either the issue type or an error
 */
export async function getIssueTypeById(
	projectKey: string,
	issueTypeId: string,
	config: JiraApiConfig,
): Promise<Try<JiraIssueType>> {
	// First get all issue types for the project (using cache if available)

	const { error, value: issueTypes } = await getIssueTypes(projectKey, config)
	// If the API call failed, return the error
	if (error) {
		return Failure(error)
	}

	// Find the issue type by ID
	const issueType = issueTypes.find((it) => it.id === issueTypeId)

	if (!issueType) {
		return Failure(new Error(`Issue type with ID ${issueTypeId} not found for project ${projectKey}`))
	}

	return Success(issueType)
}
