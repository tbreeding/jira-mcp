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
		'Update and validate specific field values in the wizard state after retrieving the necessary fields with `getFields`. Fields are always validated and persisted if valid. If validation fails, an error is returned. Always check the response for side effect information.',
	inputSchema: {
		type: 'object',
		properties: {
			fields: {
				type: 'object',
				description:
					'Field values to validate and persist in the wizard state. Fields are always validated and persisted if valid. Otherwise, an error is returned.',
				additionalProperties: true,
			},
		},
		required: ['fields'],
	},
}
