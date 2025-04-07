/**
 * Utility functions for handling Jira issue keys
 *
 * This module provides utility functions for extracting and validating
 * Jira issue keys from various parameter formats. These functions are
 * used by Jira-related tools to ensure consistent parameter handling.
 */

/**
 * Check if an object contains an issueKey property
 */
export function hasIssueKeyProperty(obj: unknown): obj is { issueKey: string } {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'issueKey' in obj &&
		typeof (obj as { issueKey: unknown }).issueKey === 'string'
	)
}

/**
 * Extract issueKey parameter from different possible locations
 * @param parameters - Tool parameters
 */
export function extractIssueKey(parameters: Record<string, unknown>): string | null {
	// Try to get issueKey directly from parameters
	if (hasIssueKeyProperty(parameters)) {
		return parameters.issueKey
	}

	// Try to get issueKey from nested arguments if present
	const args = parameters.arguments
	if (hasIssueKeyProperty(args)) {
		return args.issueKey
	}

	return null
}
