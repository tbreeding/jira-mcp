/**
 * Reset State Wizard Tool Definition
 *
 * This file contains the definition for the tool that resets
 * the state of the issue creation wizard.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Reset the state of the issue creation wizard
 */
export const resetStateWizardTool: Tool = {
	name: 'issueCreation_resetState',
	description:
		'Resets the issue creation wizard state completely, clearing any selected project, issue type, or field values. Stops any ongoing wizard process.',
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
