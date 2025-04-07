/**
 * Generic Jira GET Tool Integration
 *
 * This module provides the integrated entry point for the Generic Jira GET tool.
 * It combines the tool definition and executor components and provides a
 * factory function to create properly configured tool executors. This approach
 * maintains a clean separation of concerns while providing a unified API.
 */

import { safeExecute } from '../../../errors/handlers'
import { ErrorCode } from '../../../errors/types'
import { jiraGetTool as baseJiraGetTool } from './utils/toolDefinitions'
import { executeJiraGetTool } from './utils/toolExecutor'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor, ToolResult } from '../../../types'

/**
 * The Generic Jira GET tool definition with enhanced documentation
 */
export const jiraGetTool = {
	...baseJiraGetTool,
	// Additional metadata can be added here if needed in the future
}

/**
 * Helper function that executes the JiraGetTool with the given parameters and config
 * This is exported to make testing easier
 */
export function executeToolWithParams(
	parameters: Record<string, unknown>,
	jiraConfig: JiraApiConfig,
): Promise<ToolResult> {
	return executeJiraGetTool(parameters, jiraConfig)
}

/**
 * Creates a configured executor for the Generic Jira GET tool
 * Adds enhanced error handling and validation
 */
export function getJiraGetToolExecutor(jiraConfig: JiraApiConfig): ToolExecutor {
	return async function (parameters: Record<string, unknown>): Promise<ToolResult> {
		const result = await safeExecute(
			() => executeToolWithParams(parameters, jiraConfig),
			'jiraGet tool execution failed',
			ErrorCode.TOOL_EXECUTION_ERROR,
		)

		// Return error result
		if (!result.success) {
			const errorMessage = `Error: ${result.error?.message}`
			const errorResult: ToolResult = {
				content: [
					{
						type: 'text',
						text: errorMessage,
					},
				],
				isError: true,
			}
			return errorResult
		}

		// Return success result
		return result.data
	}
}
