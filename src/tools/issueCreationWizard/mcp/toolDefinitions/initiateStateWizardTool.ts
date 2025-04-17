/**
 * Initiate State Wizard Tool Definition
 *
 * This file contains the definition for the tool that initializes
 * a new state for the issue creation wizard, specifically for testing
 * state persistence between tool calls.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Initialize a new state for the issue creation wizard
 * This is primarily for testing state persistence between tool calls
 */
export const initiateStateWizardTool: Tool = {
	name: 'issueCreation_initiateState',
	description: `Initialize a new, empty state for the issue creation wizard. Useful for testing state persistence across multiple tool calls. IMPORTANT: Do not jump ahead in the workflow. Always follow the steps in order and wait for the user's response before moving to the next step.
		
		1. Initiate State
		2. Choose a project
		3. Choose an issue type
		4. Retrieve the fields for the issue type
		5. Update the state with the fields
		6. Iterate through the fields and update the state with the field metadata
		7. Analyze the issue for good scrum and agile practices and fields
		8. Create the issue`,
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
