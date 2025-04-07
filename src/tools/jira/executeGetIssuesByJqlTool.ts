/**
 * Jira Issue Search by JQL Tool Execution Module
 *
 * This module contains the core execution logic for the Jira issue search tool.
 * It handles parameter validation, calling the API function, and formatting the
 * results for the caller.
 */

import { searchIssuesByJql } from '../../jira/api/searchIssuesByJql'
import { log } from '../../utils/logger'
import { extractParameters } from '../utils'
import { mapIssueToEssentialFields } from './issueMapper'
import { formatSearchResponseWithPagination } from './responseFormatter'
import type { JiraApiConfig } from '../../jira/api/apiTypes'
import type { ToolResult } from '../../types'

export async function executeGetIssuesByJqlTool(
	parameters: { arguments: Record<string, unknown> },
	jiraConfig: JiraApiConfig,
): Promise<ToolResult> {
	log(`DEBUG: getIssuesByJql tool parameters: ${JSON.stringify(parameters)}`)

	const { jql, startAt, maxResults } = extractParameters(parameters, {
		startAt: 0,
		maxResults: 50,
	}) as { jql?: string; startAt: number; maxResults: number }

	if (!jql || typeof jql !== 'string') {
		log('ERROR: getIssuesByJql tool error: JQL query is required')
		return {
			content: [{ type: 'text', text: 'Error: JQL query is required' }],
			isError: true,
		}
	}

	const { error, value: searchResponse } = await searchIssuesByJql(jql, jiraConfig, startAt, maxResults)

	if (error) {
		log(`ERROR: getIssuesByJql tool error: ${error.message}`)
		return {
			content: [{ type: 'text', text: `Error: ${error.message}` }],
			isError: true,
		}
	}

	const essentialIssues = searchResponse.issues.map((issue) => {
		return mapIssueToEssentialFields(issue as unknown as Record<string, unknown>)
	})

	return formatSearchResponseWithPagination(searchResponse, essentialIssues)
}
