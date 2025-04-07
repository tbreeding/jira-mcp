/**
 * MCP Request Handler: prompts/list
 *
 * Handles the 'prompts/list' request from MCP clients.
 * It retrieves all available prompt definitions from the registry
 * and returns them in the format expected by the MCP specification.
 */

import { getAllPromptDefinitions } from '../registry'
import type { PromptArgument } from '../definitions/prompt.types'

// Define RequestHandlerExtra locally if SDK export is not found
// Based on definition in protocol.d.ts
interface RequestHandlerExtraPlaceholder {
	signal: AbortSignal
	sessionId?: string
}

// Define the expected response structure locally if SDK export is unclear
interface SimplePromptDefinition {
	name: string
	description?: string
	arguments?: PromptArgument[]
}
// Export the response shape interface
interface ListPromptsResponseShape {
	prompts: SimplePromptDefinition[]
}

/**
 * Handles the prompts/list request.
 *
 * @param _request Not used for list prompts, but part of the generic signature.
 * @param _extra Additional request data (unused).
 * @returns A promise that resolves with the list of available prompts.
 */
export async function handleListPrompts(
	_request: unknown, // Placeholder for request param
	_extra: RequestHandlerExtraPlaceholder, // Use local placeholder type
): Promise<ListPromptsResponseShape> {
	const prompts = getAllPromptDefinitions()

	// Map the full prompt definitions to the simpler shape expected by the response
	const simplePrompts: SimplePromptDefinition[] = prompts.map((prompt) => ({
		name: prompt.name,
		description: prompt.description,
		arguments: prompt.arguments,
		// Explicitly omit validateArguments and getMessages
	}))

	return { prompts: simplePrompts }
}
