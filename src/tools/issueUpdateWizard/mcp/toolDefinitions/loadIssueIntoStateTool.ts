/**
 * MCP Tool Definition: Load Issue Into State
 *
 * This file defines the MCP tool for loading an existing Jira issue into the state manager.
 * It enables the unified update workflow by allowing any issue to be fetched and loaded into state
 * via the public tool interface. Input: { issueKey: string }. Output: { success: true, state: WizardState } or { success: false, error: ErrorObject }.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

export const loadIssueIntoStateTool: Tool = {
	name: 'issueUpdateWizard_loadIssueIntoState',
	description: `Fetch a Jira issue by key and load it into the state manager for unified update workflows.\n\nInput: { issueKey: string }\nOutput: { success: true, state: WizardState } or { success: false, error: ErrorObject }`,
	inputSchema: {
		type: 'object',
		properties: {
			issueKey: {
				type: 'string',
				description: 'The key of the Jira issue to load (e.g., PROJ-123)',
			},
		},
		required: ['issueKey'],
	},
}
