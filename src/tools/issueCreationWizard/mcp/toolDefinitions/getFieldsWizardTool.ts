/**
 * Get Fields Wizard Tool Definition
 *
 * This file defines the MCP tool interface for retrieving field metadata
 * in the Jira Issue Creation Wizard. It provides field information for the
 * selected project and issue type, including validation rules.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Define the tool for retrieving field metadata
 */
export const getFieldsWizardTool: Tool = {
	name: 'mcp_IssueCreationWizard_getFields',
	description: `Retrieve the available fields required for the currently selected project and issue type. 
	
	1. Call this after selecting a project and issue type to know what information is needed.
	2. Inform the user of required and optional fields in a human-readable format.
	3. Iteratively discuss with the user to ensure all desired fields are retrieved.
	4. Do not move on to the next step until the user confirms it is OK to proceed.`,
	inputSchema: {
		type: 'object',
		properties: {
			forceRefresh: {
				type: 'boolean',
				description: 'Whether to bypass cache and force a fresh API call',
			},
		},
		required: [],
	},
}
