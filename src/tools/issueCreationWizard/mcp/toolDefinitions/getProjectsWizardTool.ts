/**
 * Get Projects Wizard Tool Definition
 *
 * This file contains the definition for the tool that retrieves
 * available Jira projects for selection in the wizard.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Get available Jira projects for selection
 */
export const getProjectsWizardTool: Tool = {
	name: 'mcp_IssueCreationWizard_getProjects',
	description:
		'Retrieve available Jira projects to start the issue creation process. This is often the first step. The wizard will guide the user to select a project.',
	inputSchema: {
		type: 'object',
		properties: {
			forceRefresh: {
				type: 'boolean',
				description: 'Whether to bypass cache and force a fresh API call',
			},
		},
	},
}
