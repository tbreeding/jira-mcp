/**
 * Jira JQL Search Tool Executor
 *
 * This file contains the executor for the JQL search tool, which handles
 * the execution of the tool by calling the API function and processing
 * the results. It also handles error cases appropriately.
 *
 * The executor includes enhanced pagination support to make it easier for
 * AI agents to navigate through large result sets.
 */

import { safeExecute } from '../../../errors/handlers'
import { ErrorCode } from '../../../errors/types'
import { log } from '../../../utils/logger'
import { executeGetIssuesByJqlTool } from '../executeGetIssuesByJqlTool'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor, ToolResult } from '../../../types'

/**
 * Create an executor for the JQL search tool
 * @param jiraConfig The Jira API configuration
 * @returns A tool executor function
 */
export function getIssuesByJqlToolExecutor(jiraConfig: JiraApiConfig): ToolExecutor {
	return async function executeJqlToolWrapper(parameters: Record<string, unknown>): Promise<ToolResult> {
		log(`DEBUG: jqlToolExecutor wrapper called with parameters: ${JSON.stringify(parameters)}`)

		// Convert parameters to the format expected by executeGetIssuesByJqlTool
		const wrappedParameters = {
			arguments: parameters.arguments as { jql: string; startAt?: number; maxResults?: number },
		}

		// Call the main implementation with error handling
		const result = await safeExecute(
			() => executeGetIssuesByJqlTool(wrappedParameters, jiraConfig),
			'getIssuesByJql tool execution failed',
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
