/**
 * Jira GET Tool Executor
 *
 * This module contains the executor function for the Generic Jira GET tool.
 * It implements the actual logic for executing the tool, including parameter
 * handling, API communication, and result formatting.
 */

import { callJiraApi, RestMethod } from '../../../../jira/api/callJiraApi'
import { log } from '../../../../utils/logger'
import { extractEndpoint, extractQueryParams, validateEndpoint } from './parameterUtils'
import { buildQueryString } from './queryStringUtils'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'
import type { ToolResult } from '../../../../types'

/**
 * Execute the jiraGet tool
 * @param parameters - Tool parameters
 * @param jiraConfig - Jira API configuration
 */
export async function executeJiraGetTool(
	parameters: Record<string, unknown>,
	jiraConfig: JiraApiConfig,
): Promise<ToolResult> {
	log(`DEBUG: jiraGet tool parameters: ${JSON.stringify(parameters)}`)

	// Extract and validate endpoint
	const endpoint = extractEndpoint(parameters)
	if (!endpoint) {
		log('ERROR: Missing or invalid endpoint parameter')
		return {
			content: [
				{
					type: 'text',
					text: 'Error: Missing or invalid endpoint parameter',
				},
			],
			isError: true,
		}
	}

	if (!validateEndpoint(endpoint)) {
		return {
			content: [
				{
					type: 'text',
					text: 'Error: Invalid endpoint format. Endpoint must start with a slash (/).',
				},
			],
			isError: true,
		}
	}

	// Extract query parameters (optional)
	const queryParams = extractQueryParams(parameters) || {}

	// Build the query string
	const queryString = buildQueryString(queryParams)

	// Combine endpoint and query string
	const fullEndpoint = `${endpoint}${queryString}`

	log(`DEBUG: Making GET request to ${fullEndpoint}`)

	// Make the API call
	const result = await callJiraApi({
		config: jiraConfig,
		endpoint: fullEndpoint,
		method: RestMethod.GET,
	})

	// Handle API error
	if (!result.success && result.error) {
		log(`ERROR: Failed to fetch data from Jira API: ${result.error.message}`)
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(result),
				},
			],
			isError: true,
		}
	}

	// Return the raw response
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(result),
			},
		],
	}
}
