/**
 * Get State Wizard Tool Definition
 *
 * This file contains the definition for the tool that gets
 * the current state of the issue creation wizard.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Get the current state of the issue creation wizard
 */
export const getStateWizardTool: Tool = {
	name: 'issueCreation_getState',
	description:
		'Get the current internal state of the issue creation wizard, including selected project, issue type, and entered field values. Useful for checking progress or debugging.',
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
