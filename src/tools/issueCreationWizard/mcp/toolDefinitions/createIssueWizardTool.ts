/**
 * Create Issue Wizard Tool Definition
 *
 * This file contains the definition for the tool that creates
 * a Jira issue using the current wizard state.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Create a Jira issue using the current wizard state
 */
export const createIssueWizardTool: Tool = {
	name: 'issueCreation_createIssue',
	description: `Finalizes the wizard process by creating a Jira issue using the currently configured state (project, issue type, fields). 
	
	1. Don't execute without consulting the user first.
	2. Create the issue.
	3. Return the issue key, the url to the issue, and a success message with the summary of the fields.`,
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
