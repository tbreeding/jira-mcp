/**
 * Jira Issue Analysis Tool Implementation
 *
 * This module implements a tool for performing comprehensive analysis of Jira issues.
 * It provides the tool definition and factory function to create tool executors.
 * The actual execution logic is delegated to a separate module for better code organization.
 */

import { safeExecute } from '../../errors/handlers'
import { ErrorCode } from '../../errors/types'
import { executeAnalyzeIssueTool } from './executeAnalyzeIssueTool'
import type { JiraApiConfig } from '../../jira/api/apiTypes'
import type { ToolExecutor, ToolResult } from '../../types'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Jira analyze issue tool definition
 */
export const analyzeIssueTool: Tool = {
	name: 'analyzeJiraIssue',
	description: 'Performs comprehensive analysis of a Jira issue',
	inputSchema: {
		type: 'object',
		properties: {
			issueKey: {
				type: 'string',
				description: 'The key of the Jira issue to analyze (e.g., "PROJ-123")',
			},
		},
		required: ['issueKey'],
	},
}

/**
 * Get analyzeJiraIssue tool executor
 * @param jiraConfig - Validated Jira API configuration
 */
export function getAnalyzeIssueToolExecutor(jiraConfig: JiraApiConfig): ToolExecutor {
	return async function (parameters: Record<string, unknown>): Promise<ToolResult> {
		const result = await safeExecute(
			() => executeAnalyzeIssueTool(parameters as { arguments: { issueKey: string } }, jiraConfig),
			'analyzeJiraIssue tool execution failed',
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
