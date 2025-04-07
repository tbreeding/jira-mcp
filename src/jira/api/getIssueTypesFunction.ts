/**
 * Jira issue type retrieval functionality
 *
 * This file implements the API call required to fetch issue types from Jira.
 * It includes caching mechanism to prevent excessive API calls.
 */

import { log } from '../../utils/logger'
import { Failure, Success } from '../../utils/try'
import { isCacheValid, updateCache, getFromCacheUnsafe } from './issueTypeCache'
import { validateProjectKey, getIssueTypesFromProject } from './issueTypeHelpers'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'
import type { JiraIssueType } from '../types/issueType.types'

/**
 * Checks if valid cached data is available
 */
function checkCache(projectKey: string, forceRefresh: boolean): boolean {
	if (!forceRefresh && isCacheValid(projectKey)) {
		log(`DEBUG: Returning issue types for project ${projectKey} from cache`)
		return true
	}
	return false
}

/**
 * Retrieves all issue types for a specific Jira project
 * @param projectKey The key of the project to retrieve issue types for
 * @param config Jira API configuration
 * @param forceRefresh Whether to bypass cache and force a fresh API call
 * @returns A Result object containing either the issue types or an error
 */
export async function getIssueTypes(
	projectKey: string,
	config: JiraApiConfig,
	forceRefresh = false,
): Promise<Try<JiraIssueType[]>> {
	// Validate project key
	const validationResult = validateProjectKey(projectKey)
	if (validationResult.error) {
		return Failure(validationResult.error)
	}

	// Return cached data if available and not forcing refresh
	if (checkCache(projectKey, forceRefresh)) {
		return Success(getFromCacheUnsafe(projectKey))
	}

	log('DEBUG: Trying project endpoint')
	const projectResult = await getIssueTypesFromProject(projectKey, config)

	if (!projectResult.error) {
		updateCache(projectKey, projectResult.value)
	}

	return projectResult
}
