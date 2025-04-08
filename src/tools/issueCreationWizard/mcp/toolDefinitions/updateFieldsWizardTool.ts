/**
 * Update Fields Wizard Tool Definition
 *
 * This file defines the MCP tool interface for updating field values
 * in the Jira Issue Creation Wizard.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Tool for updating field values in the wizard state
 */
export const updateFieldsWizardTool: Tool = {
	name: 'issueCreation_updateFields',
	description:
		'Update specific field values in the wizard state after retrieving the necessary fields with `getFields`. Use `validateOnly` to check fields without saving.',
	inputSchema: {
		type: 'object',
		properties: {
			fields: {
				type: 'object',
				description: 'Field values to update in the wizard state',
				additionalProperties: true,
			},
			validateOnly: {
				type: 'boolean',
				description: 'Whether to only validate the fields without updating state',
			},
		},
		required: ['fields'],
	},
}
