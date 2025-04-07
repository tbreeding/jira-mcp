/**
 * Generic Jira GET Tool Definition
 *
 * This module defines the schema for the Generic Jira GET tool.
 * It specifies the name, description, and input schema for the tool
 * according to the MCP SDK Tool interface.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Generic Jira GET tool definition
 */
export const jiraGetTool: Tool = {
	name: 'jiraGet',
	description: 'Fetches data from any Jira API GET endpoint',
	inputSchema: {
		type: 'object',
		properties: {
			endpoint: {
				type: 'string',
				description: 'The Jira API endpoint path to call (e.g., "/rest/api/3/issue/PROJ-123")',
			},
			queryParams: {
				type: 'object',
				description: 'Optional query parameters to include in the request',
				additionalProperties: true,
			},
		},
		required: ['endpoint'],
	},
}
