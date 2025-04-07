/**
 * Update State Wizard Tool Definition
 *
 * This file contains the definition for the tool that updates
 * the state of the issue creation wizard with new values.
 */

import { WizardStep } from '../../types'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Update the state of the issue creation wizard
 */
export const updateStateWizardTool: Tool = {
	name: 'mcp_IssueCreationWizard_updateState',
	description:
		'Update the core state of the issue creation wizard. Use this to set the `projectKey`, `issueTypeId`, `fields`, or advance the `step` in the process.',
	inputSchema: {
		type: 'object',
		properties: {
			step: {
				type: 'string',
				enum: Object.values(WizardStep),
				description: 'The wizard step to transition to',
			},
			projectKey: {
				type: 'string',
				description: 'The key of the Jira project to create the issue in',
			},
			issueTypeId: {
				type: 'string',
				description: 'The ID of the issue type to create',
			},
			fields: {
				type: 'object',
				description: 'Field values for the issue',
				additionalProperties: true,
			},
		},
	},
}
