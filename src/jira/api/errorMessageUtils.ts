/**
 * Error message utilities for Jira API
 *
 * This file contains helper functions for handling and formatting error messages
 * from Jira API responses.
 */

/**
 * Extracts error message from an API error response
 * @param errorData The error data object returned from the API
 * @param status The HTTP status code
 * @returns Formatted error message string
 */
export function getErrorMessage(errorData: { errorMessages?: string[] }, status: number): string {
	// Check if errorData has errorMessages array
	if (Array.isArray(errorData.errorMessages) && errorData.errorMessages.length > 0) {
		return `Error: ${errorData.errorMessages[0]}, Status: ${status}`
	}

	// For backward compatibility with tests
	return `Failed to fetch Jira issue. Status: ${status}`
}
