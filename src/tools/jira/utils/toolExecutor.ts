/**
 * Jira Tool Executors
 *
 * This module contains the executor functions for Jira-related tools.
 * These functions implement the actual logic for executing the tools,
 * including parameter handling, API communication, and result formatting.
 */

import { safeExecute } from '../../../errors/handlers'
import { ErrorCode } from '../../../errors/types'
import { getIssueByKey } from '../../../jira/api/getIssue'
import { log } from '../../../utils/logger'
import { extractIssueKey } from './issueKeyUtils'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor, ToolResult } from '../../../types'

/**
 * Execute the getJiraIssue tool
 * @param parameters - Tool parameters
 * @param jiraConfig - Jira API configuration
 */
async function executeGetIssueTool(
	parameters: Record<string, unknown>,
	jiraConfig: JiraApiConfig,
): Promise<ToolResult> {
	log(`DEBUG: getJiraIssue tool parameters: ${JSON.stringify(parameters)}`)

	const issueKey = extractIssueKey(parameters)

	if (!issueKey) {
		log('ERROR: Missing or invalid issueKey parameter')
		return {
			content: [
				{
					type: 'text',
					text: 'Error: Missing or invalid issueKey parameter',
				},
			],
			isError: true,
		}
	}

	const result = await getIssueByKey(issueKey, jiraConfig)
	if (!result.success && result.error) {
		log(`ERROR: Failed to fetch Jira issue: ${result.error.message}`)
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

	// Return the raw response as requested
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(result),
			},
		],
	}
}

/**
 * Get getJiraIssue tool executor
 * @param jiraConfig - Validated Jira API configuration
 */
export function getIssueToolExecutor(jiraConfig: JiraApiConfig): ToolExecutor {
	return async function (parameters: Record<string, unknown>): Promise<ToolResult> {
		const result = await safeExecute(
			() => executeGetIssueTool(parameters, jiraConfig),
			'getJiraIssue tool execution failed',
			ErrorCode.TOOL_EXECUTION_ERROR,
		)

		if (!result.success) {
			return {
				content: [
					{
						type: 'text',
						text: `Error: ${result.error.message}`,
					},
				],
				isError: true,
			}
		}

		return result.data
	}
}
