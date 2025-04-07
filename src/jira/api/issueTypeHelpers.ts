/**
 * Helper functions for Jira issue type retrieval
 */

import { log } from '../../utils/logger'
import { Failure, Success } from '../../utils/try'
import { callJiraApi, RestMethod } from './callJiraApi'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'
import type { JiraIssueType } from '../types/issueType.types'
import type { JiraProjectResponse } from '../types/project.types'

/**
 * Validates the project key
 */
export function validateProjectKey(projectKey: string): Try<void> {
	if (!projectKey) {
		log('ERROR: Missing project key for issue types retrieval')
		return Failure(new Error('Project key is required to retrieve issue types'))
	}
	return Success(undefined)
}

/**
 * Retrieves issue types using the project endpoint
 */
export async function getIssueTypesFromProject(
	projectId: string,
	config: JiraApiConfig,
): Promise<Try<JiraIssueType[]>> {
	const endpoint = `/rest/api/3/project/${projectId}?expand=issuetypes`

	log(`DEBUG: Falling back to project endpoint: ${endpoint}`)

	const { error, value: response } = await callJiraApi<Record<string, never>, JiraProjectResponse>({
		config,
		endpoint,
		method: RestMethod.GET,
	})

	if (error) {
		log(`ERROR: Failed to retrieve issue types from project: ${error.message}`)
		return Failure(error)
	}

	const typedResponse = response as JiraProjectResponse
	const issueTypes = typedResponse.issueTypes || []
	log(`DEBUG: Retrieved ${issueTypes.length} issue types from project endpoint`)
	return Success(issueTypes)
}
