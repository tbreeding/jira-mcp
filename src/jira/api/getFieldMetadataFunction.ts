/**
 * Jira field metadata retrieval functionality
 *
 * This file implements the API call required to fetch field metadata from Jira.
 * It includes caching mechanism to prevent excessive API calls.
 */

import { log } from '../../utils/logger'
import { Failure, Success } from '../../utils/try'
import { callJiraApi, RestMethod } from './callJiraApi'
import { isCacheValid, updateCache, getFromCacheUnsafe } from './fieldMetadataCache'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'
import type { JiraFieldMetadataResponse } from '../types/fieldMetadata.types'

/**
 * Validates input parameters for field metadata retrieval
 */
function validateInputParameters(projectKey: string, issueTypeId: string): Try<void> {
	if (!projectKey) {
		log('ERROR: Missing project key for field metadata retrieval')
		return Failure(new Error('Project key is required to retrieve field metadata'))
	}

	if (!issueTypeId) {
		log('ERROR: Missing issue type ID for field metadata retrieval')
		return Failure(new Error('Issue type ID is required to retrieve field metadata'))
	}

	return Success(undefined)
}

/**
 * Logs field count information for debugging purposes
 */
function logFieldCount(response: JiraFieldMetadataResponse, projectKey: string, issueTypeId: string): void {
	if (response.projects.length > 0 && response.projects[0].issuetypes.length > 0) {
		const fieldCount = Object.keys(response.projects[0].issuetypes[0].fields).length
		log(`DEBUG: Retrieved ${fieldCount} fields for project ${projectKey} and issue type ${issueTypeId} from API`)
	}
}

/**
 * Retrieves field metadata for creating issues in a project with specific issue type
 */
export async function getFieldMetadata(
	projectKey: string,
	issueTypeId: string,
	config: JiraApiConfig,
	forceRefresh = false,
): Promise<Try<JiraFieldMetadataResponse>> {
	// Validate input parameters
	const validationResult = validateInputParameters(projectKey, issueTypeId)
	if (validationResult.error) {
		return Failure(validationResult.error)
	}

	// Return cached data if available and not forcing refresh
	if (!forceRefresh && isCacheValid(projectKey, issueTypeId)) {
		log(`DEBUG: Returning field metadata for project ${projectKey} and issue type ${issueTypeId} from cache`)
		return Success(getFromCacheUnsafe(projectKey, issueTypeId))
	}

	// Call Jira API to get field metadata
	const { error, value: response } = await callJiraApi<Record<string, never>, JiraFieldMetadataResponse>({
		config,
		endpoint: `/rest/api/3/issue/createmeta?projectKeys=${projectKey}&issuetypeIds=${issueTypeId}&expand=projects.issuetypes.fields`,
		method: RestMethod.GET,
	})

	// If the API call failed, return the error
	if (error) {
		log(`ERROR: Failed to retrieve field metadata for project ${projectKey} and issue type ${issueTypeId}`, error)
		return Failure(error)
	}

	// Add debug log to show raw response
	log(`DEBUG: Raw API response for field metadata: ${JSON.stringify(response)}`)

	// Update cache with the new data
	updateCache(projectKey, issueTypeId, response as JiraFieldMetadataResponse)

	// Log the number of fields retrieved for debugging
	logFieldCount(response as JiraFieldMetadataResponse, projectKey, issueTypeId)

	return Success(response as JiraFieldMetadataResponse)
}
