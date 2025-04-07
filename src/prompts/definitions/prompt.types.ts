/**
 * Type Definitions for MCP Prompts
 *
 * This file defines the core TypeScript interfaces and types used for structuring
 * and handling Model Context Protocol (MCP) prompt definitions within the application.
 * It includes types for prompt arguments, the overall prompt structure, and the
 * expected format for generating messages in response to a prompts/get request.
 */
import type Try from '../../utils/try' // Import the Try type
import type { PromptArgument as McpPromptArgument } from '@modelcontextprotocol/sdk/types.js'

export interface McpMessage {
	role: 'user' | 'assistant' | 'system' | 'tool'
	content: {
		type: 'text' | 'resource'
		text?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resource?: any // Use a more specific type if possible
	}
}

export type GetPromptArgs = Record<string, unknown>
export type PromptArgument = McpPromptArgument

export interface McpPrompt {
	name: string
	description?: string
	arguments: PromptArgument[]
	validateArguments: (args?: GetPromptArgs) => Try<null>
	getMessages: (args: GetPromptArgs) => { messages: McpMessage[] }
}
