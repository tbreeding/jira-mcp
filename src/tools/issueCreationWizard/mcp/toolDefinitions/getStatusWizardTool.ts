/**
 * Get Status Wizard Tool Definition
 *
 * This file contains the definition for the tool that gets
 * status information about the issue creation wizard.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Get the status of the issue creation wizard
 */
export const getStatusWizardTool: Tool = {
	name: 'mcp_IssueCreationWizard_getStatus',
	description:
		'Get high-level status information about the issue creation wizard, such as the current step (e.g., project selection, field completion).',
	inputSchema: {
		type: 'object',
		properties: {
			// Add a dummy parameter because the MCP server requires at least one property for no-parameter tools
			// This can be removed if the server behavior changes.
			random_string: {
				type: 'string',
				description: 'Dummy parameter for no-parameter tools',
			},
		},
		required: ['random_string'], // Make the dummy parameter required
	},
}
