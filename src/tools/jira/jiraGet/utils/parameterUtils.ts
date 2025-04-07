/**
 * Parameter Utility Functions for Generic Jira GET Tool
 *
 * This module provides utility functions for validating and extracting
 * parameters for the Generic Jira GET tool. It ensures consistent parameter
 * handling and validation across different uses of the tool.
 */

import { log } from '../../../../utils/logger'

/**
 * Check if an object contains an endpoint property
 */
function hasEndpointProperty(obj: unknown): obj is { endpoint: string } {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'endpoint' in obj &&
		typeof (obj as { endpoint: unknown }).endpoint === 'string'
	)
}

/**
 * Check if an object contains a queryParams property
 */
function hasQueryParamsProperty(obj: unknown): obj is { queryParams: Record<string, unknown> } {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'queryParams' in obj &&
		typeof (obj as { queryParams: unknown }).queryParams === 'object' &&
		(obj as { queryParams: unknown }).queryParams !== null
	)
}

/**
 * Extract endpoint parameter from different possible locations
 * @param parameters - Tool parameters
 */
export function extractEndpoint(parameters: Record<string, unknown>): string | null {
	// Try to get endpoint directly from parameters
	if (hasEndpointProperty(parameters)) {
		return parameters.endpoint
	}

	// Try to get endpoint from nested arguments if present
	const args = parameters.arguments
	if (hasEndpointProperty(args)) {
		return args.endpoint
	}

	return null
}

/**
 * Extract queryParams parameter from different possible locations
 * @param parameters - Tool parameters
 */
export function extractQueryParams(parameters: Record<string, unknown>): Record<string, unknown> | null {
	// Try to get queryParams directly from parameters
	if (hasQueryParamsProperty(parameters)) {
		return parameters.queryParams
	}

	// Try to get queryParams from nested arguments if present
	const args = parameters.arguments
	if (hasQueryParamsProperty(args)) {
		return args.queryParams
	}

	return null
}

/**
 * Validates that an endpoint is properly formatted
 * @param endpoint - Endpoint to validate
 */
export function validateEndpoint(endpoint: string): boolean {
	if (!endpoint) {
		log('ERROR: Endpoint cannot be empty')
		return false
	}

	// Ensure endpoint starts with a slash
	if (!endpoint.startsWith('/')) {
		log(`ERROR: Endpoint must start with a slash: ${endpoint}`)
		return false
	}

	return true
}
