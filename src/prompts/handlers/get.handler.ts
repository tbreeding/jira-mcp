/**
 * MCP Request Handler: prompts/get
 *
 * Handles the 'prompts/get' request from MCP clients.
 * It finds the requested prompt by name using the registry,
 * validates the provided arguments, executes the prompt's message generation logic,
 * and returns the resulting messages according to the MCP specification.
 */

import { log } from '../../utils/logger'
import { findPromptByName } from '../registry'
// Type imports - adjust order as needed
import type { GetPromptArgs, McpMessage } from '../definitions/prompt.types'
import type { GetPromptRequest } from '@modelcontextprotocol/sdk/types.js'

interface RequestHandlerExtraPlaceholder {
	signal: AbortSignal
	sessionId?: string
}

interface GetPromptResponseShape {
	messages: McpMessage[]
}

/**
 * Handles the prompts/get request.
 *
 * @param request The incoming GetPromptRequest object.
 * @param _extra Additional request data (unused).
 * @returns A promise that resolves with the GetPromptResponse containing the generated messages.
 */
export async function handleGetPrompt(
	request: GetPromptRequest,
	_extra: RequestHandlerExtraPlaceholder, // Add extra param with local type
): Promise<GetPromptResponseShape> {
	const { name, arguments: args } = request.params

	log(`INFO: Received prompts/get request for prompt: ${name}`)

	const prompt = findPromptByName(name)

	if (!prompt) {
		log(`ERROR: Prompt not found: ${name}`)
		// eslint-disable-next-line custom-rules/no-throw-statements
		throw new Error(`Prompt not found: ${name}`)
	}

	try {
		const validationResult = prompt.validateArguments(args)
		if (!validationResult.success) {
			log(`ERROR: Argument validation failed for prompt ${name}: ${validationResult.error.message}`)
			// eslint-disable-next-line custom-rules/no-throw-statements
			throw validationResult.error
		}

		const result = prompt.getMessages(args as GetPromptArgs)

		log(`INFO: Successfully generated messages for prompt: ${name}`)
		return result
	} catch (error) {
		log(`ERROR: Error processing prompt ${name}: ${(error as Error).message}`)
		// eslint-disable-next-line custom-rules/no-throw-statements
		throw new Error(`Failed to process prompt ${name}: ${(error as Error).message}`)
	}
}
