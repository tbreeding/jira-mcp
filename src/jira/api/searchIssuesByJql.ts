/**
 * Jira issue search by JQL functionality
 *
 * This file implements the API calls required to search for Jira issues
 * using JQL (Jira Query Language). It provides the functionality for
 * retrieving multiple issues that match specified criteria.
 */

import { log } from '../../utils/logger'
import { Failure, Success } from '../../utils/try'
import { callJiraApi, RestMethod } from './callJiraApi'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'
import type { JiraIssue } from '../types/issue.types'

/**
 * Interface for Jira search response
 */
interface JiraSearchResponse {
	startAt: number
	maxResults: number
	total: number
	issues: JiraIssue[]
}

/**
 * Search for Jira issues using a JQL query
 * @param jqlQuery The JQL query string
 * @param config The Jira API configuration
 * @param startAt Optional pagination start index
 * @param maxResults Optional maximum number of results to return
 * @returns A Result object containing either the search response or an error
 */
export async function searchIssuesByJql(
	jqlQuery: string,
	config: JiraApiConfig,
	startAt = 0,
	maxResults = 50,
): Promise<Try<JiraSearchResponse>> {
	// Encode the JQL query for URL inclusion
	const encodedJql = encodeURIComponent(jqlQuery)

	const result = await callJiraApi<Record<string, never>, JiraSearchResponse>({
		config,
		endpoint: `/rest/api/3/search?jql=${encodedJql}&startAt=${startAt}&maxResults=${maxResults}`,
		method: RestMethod.GET,
	})
	// If the API call failed, return the error
	if (result.error) {
		log(`ERROR: searchIssuesByJql failed: ${result.error.message}`)
		return Failure(result.error)
	}

	const typedValue = result.value as JiraSearchResponse
	// Log success for debugging
	log(
		`DEBUG: searchIssuesByJql response: Found ${typedValue.issues.length} issues out of ${typedValue.total} total matches`,
	)

	// Return the complete search response with pagination metadata
	return Success(typedValue)
}
