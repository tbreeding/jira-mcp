/**
 * Analyze Issue Wizard Tool Definition
 *
 * This file contains the definition for the tool that provides
 * specific analysis of an issue being created via the wizard.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Analyze the issue being created in the wizard
 */
export const analyzeIssueWizardTool: Tool = {
	name: 'mcp_IssueCreationWizard_analyzeIssue',
	description:
		'Analyzes the issue being created in the wizard and provides specific insights, best practices, and improvement suggestions.',
	inputSchema: {
		type: 'object',
		properties: {
			random_string: {
				type: 'string',
				description: 'Dummy parameter for no-parameter tools',
			},
		},
		required: ['random_string'],
	},
}
