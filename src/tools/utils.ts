/**
 * Tool Utilities Module
 *
 * This module provides utility functions for working with tool executors.
 * It includes helpers for parameter extraction, validation, and result formatting
 * to ensure consistency across different tool implementations.
 */

import { log } from '../utils/logger'

/**
 * Extract parameters safely from the arguments object
 * @param parameters - The parameters object from the tool executor
 * @param paramName - The name of the parameter to extract
 * @param defaultValue - Optional default value to use if parameter is not found
 * @returns The extracted parameter value
 */
export function extractParameter<T>(
	parameters: { arguments: Record<string, unknown> },
	paramName: string,
	defaultValue?: T,
): T | undefined {
	if (!parameters?.arguments) {
		log(`WARNING: Parameters object is missing or invalid when extracting ${paramName}`)
		return defaultValue
	}

	const value = parameters.arguments[paramName] as T | undefined
	return value !== undefined ? value : defaultValue
}

/**
 * Extract multiple parameters safely from the arguments object
 * @param parameters - The parameters object from the tool executor
 * @param paramNames - The names of the parameters to extract
 * @returns An object containing the extracted parameters
 */
export function extractParameters<T extends Record<string, unknown>>(
	parameters: { arguments: Record<string, unknown> },
	defaults?: Partial<T>,
): Partial<T> {
	log(`DEBUG: extractParameters: ${JSON.stringify(parameters)}`)
	if (!parameters?.arguments) {
		log('WARNING: Parameters object is missing or invalid')
		return defaults || {}
	}

	// Type assertion is safe here because we're just collecting properties that exist
	const result = { ...defaults } as Partial<T>

	// Copy all available parameters to the result object
	for (const key in parameters.arguments) {
		// @ts-expect-error - Dynamic property assignment is expected here
		result[key] = parameters.arguments[key]
	}

	return result
}
