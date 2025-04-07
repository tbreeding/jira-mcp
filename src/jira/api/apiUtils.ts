/**
 * Jira API utility functions
 *
 * This file contains helper functions and utilities for working with the
 * Jira API, including request formatting, response parsing, and common
 * operations that are used across multiple API endpoints.
 */

import { log } from '../../utils/logger'
import { Failure } from '../../utils/try'
import { getErrorMessage } from './errorMessageUtils'
import type Try from '../../utils/try'

/**
 * Handles API error responses
 * @param response The fetch response object
 * @param context Context info for logging
 * @returns The formatted error response
 */
export async function handleApiError(response: Response, context: string): Promise<Try<never>> {
	log(`handleApiError ERROR: ${context}. Status: ${response.status}`)

	// Parse the error response
	const errorData = await response.json()

	// Extract error message from the response if available
	log(`handleApiError ERROR: ${context}. Status: ${response.status} - Keys: ${JSON.stringify(Object.keys(errorData))}`)
	log(`handleApiError ERROR: ${context}. Status: ${response.status} - Error Data: ${JSON.stringify(errorData)}`)
	const errorMessage = getErrorMessage(errorData, response.status)

	return Failure(new Error(errorMessage))
}
