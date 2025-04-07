/**
 * MCP Prompt Registry
 *
 * Manages the collection of available MCP prompts defined in the application.
 * It provides functions to access all prompt definitions (for prompts/list)
 * and to find a specific prompt by its name (for prompts/get).
 */

import { allPrompts } from './definitions'
import type { McpPrompt } from './definitions/prompt.types'

// Simple registry implementation using the imported array

/**
 * Retrieves all defined MCP prompt definitions.
 * Used to construct the response for the prompts/list request.
 */
export function getAllPromptDefinitions(): Omit<McpPrompt, 'getMessages'>[] {
	// Return only the definition part (name, description, args), not the implementation
	return allPrompts.map(({ getMessages: _getMessages, ...definition }) => definition)
}

/**
 * Finds a specific MCP prompt definition by its unique name.
 * Used by the prompts/get handler to locate the correct prompt implementation.
 *
 * @param name The unique name of the prompt to find.
 * @returns The full McpPrompt object if found, otherwise undefined.
 */
export function findPromptByName(name: string): McpPrompt | undefined {
	return allPrompts.find((prompt) => prompt.name === name)
}
