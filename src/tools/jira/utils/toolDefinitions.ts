/**
 * Jira Tool Definitions
 *
 * This module contains the tool definitions for Jira-related tools.
 * These definitions specify the name, description, and input schema
 * for each tool, following the MCP SDK Tool interface.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Jira get issue tool definition
 */
export const getIssueTool: Tool = {
	name: 'getJiraIssue',
	description: 'Fetches a Jira issue by its key',
	inputSchema: {
		type: 'object',
		properties: {
			issueKey: {
				type: 'string',
				description: 'The key of the Jira issue to fetch (e.g., "PROJ-123")',
			},
		},
		required: ['issueKey'],
	},
}
