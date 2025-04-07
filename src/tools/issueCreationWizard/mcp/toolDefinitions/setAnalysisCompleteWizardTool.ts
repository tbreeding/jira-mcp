/**
 * Tool Definition for setting the analysis complete flag
 *
 * This module defines the MCP tool interface for the setAnalysisComplete operation.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Tool definition for setting the analysis complete flag
 */
export const setAnalysisCompleteWizardTool: Tool = {
	name: 'mcp_IssueCreationWizard_setAnalysisComplete',
	description: 'Sets the analysis complete flag for the current issue creation session',
	inputSchema: {
		type: 'object',
		properties: {
			isComplete: {
				type: 'boolean',
				description: 'Whether analysis is complete',
			},
		},
		required: ['isComplete'],
	},
}
