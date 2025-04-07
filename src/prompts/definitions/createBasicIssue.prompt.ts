/**
 * MCP Prompt Definition: Create Basic Jira Issue
 *
 * Defines the 'create-basic-issue' prompt for the Model Context Protocol.
 * This prompt guides the creation of a simple Jira issue by taking project key,
 * summary, and description as input and formulating an initial user message
 * for the LLM to act upon.
 */

import { validateRequiredArguments } from '../utils/validatePromptArguments'
import type { McpMessage, McpPrompt, GetPromptArgs } from './prompt.types'
import type Try from '../../utils/try'

export const createBasicIssuePrompt: McpPrompt = {
	name: 'create-basic-issue',
	description: 'Create a basic Jira issue with a summary and description.',
	arguments: [
		{ name: 'projectKey', description: 'Jira project key', required: true },
		{ name: 'summary', description: 'Issue summary', required: true },
		{
			name: 'description',
			description: 'Issue description',
			required: false,
		},
	],
	validateArguments: (args?: GetPromptArgs): Try<null> => {
		return validateRequiredArguments(createBasicIssuePrompt.arguments, args)
	},
	getMessages: (args: GetPromptArgs): { messages: McpMessage[] } => {
		const projectKey = args.projectKey as string
		const summary = args.summary as string
		const description = (args.description as string) || '' // Default to empty string

		return {
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: `Create Jira issue in project ${projectKey}:\nSummary: ${summary}\nDescription: ${description}`,
					},
				},
			],
		}
	},
}
