/**
 * Server Utilities Module
 *
 * This module provides utility functions for server-side operations in the Jira MCP tool.
 * It includes helpers for processing request parameters, validating input data formats,
 * and standardizing the handling of tool call requests. These utilities ensure consistent
 * parameter extraction and normalization across different API endpoints and tool calls.
 */

import { log } from '../utils/logger'
import type { ToolCallParams } from '../types'

/**
 * Process parameters from the request
 * @param request - The request object
 */
export function processRequestParameters(request: { params: ToolCallParams }): {
	name: string
	parameters: Record<string, unknown>
} {
	const { name, parameters, arguments: args } = request.params
	log(`DEBUG: processRequestParameters: ${JSON.stringify(request.params)}`)
	// Combine parameters and arguments if both exist
	let combinedParams: Record<string, unknown> = {}

	if (parameters) {
		combinedParams = { ...combinedParams, ...parameters }
	}

	// Flatten the arguments instead of nesting them
	// Arguments take precedence over parameters with the same name
	if (args) {
		combinedParams = {
			...combinedParams,
			...args,
		}
	}

	return { name, parameters: combinedParams }
}
