/**
 * Update Issue From State Tool Definition
 *
 * This file contains the definition for the tool that updates a Jira issue
 * using the current state of the wizard.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Tool for updating a Jira issue using the current state
 */
export const updateIssueFromStateTool: Tool = {
	name: 'issueUpdateWizard_updateIssueFromState',
	description: `Update a Jira issue using the current state. This tool works in two modes: 1) Immediately after creating an issue, allowing you to refine details, or 2) After loading an existing issue, making changes to the loaded issue. The tool requires no parameters as it uses the current state.

CRITICAL WORKFLOW INSTRUCTIONS:
- When updating a newly created issue: DO NOT reset the state between issue creation and update. After successful creation with issueCreation_createIssue, the state automatically transitions to UPDATING_POST_CREATE mode with the new issueKey preserved. Simply update fields as needed and then call this tool.
- When updating an existing issue: First load the issue with getJiraIssue, then initialize the update state, make field changes, and finally call this tool.
- This tool will fail if state has been reset between creation and update attempt, as it requires either UPDATING_POST_CREATE or UPDATING_EXISTING mode with a valid issueKey.`,
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
