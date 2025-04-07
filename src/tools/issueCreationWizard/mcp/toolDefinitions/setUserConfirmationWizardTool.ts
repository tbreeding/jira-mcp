/**
 * Tool Definition for setting the user confirmation flag
 *
 * This module defines the MCP tool interface for the setUserConfirmation operation.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Tool definition for setting the user confirmation flag
 */
export const setUserConfirmationWizardTool: Tool = {
	name: 'mcp_IssueCreationWizard_setUserConfirmation',
	description: `Sets the user confirmation flag for the current issue creation session. CRITICAL: Wait for the user to confirm issue creation before calling this tool.`,
	inputSchema: {
		type: 'object',
		properties: {
			confirmed: {
				type: 'boolean',
				description: 'Whether the user has confirmed issue creation',
			},
		},
		required: ['confirmed'],
	},
}
