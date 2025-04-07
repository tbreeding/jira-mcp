/**
 * Get Issue Types Wizard Tool Definition
 *
 * This file contains the definition for the tool that retrieves
 * available Jira issue types for the selected project in the wizard.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Get available Jira issue types for the selected project
 */
export const getIssueTypesWizardTool: Tool = {
	name: 'mcp_IssueCreationWizard_getIssueTypes',
	description:
		"Get available Jira issue types for the selected project. Call this *after* a project has been selected using 'updateState'. The wizard will guide the user to select an issue type.",
	inputSchema: {
		type: 'object',
		properties: {
			forceRefresh: {
				type: 'boolean',
				description: 'Whether to bypass cache and force a refresh from the API',
			},
		},
	},
}
