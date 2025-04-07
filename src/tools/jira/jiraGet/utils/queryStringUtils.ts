/**
 * Query String Utility Functions for Generic Jira GET Tool
 *
 * This module provides utility functions for building query strings
 * from parameter objects for the Generic Jira GET tool. It handles
 * different parameter types and proper URL encoding.
 */

/**
 * Process a single query parameter value
 * @param key - Parameter key
 * @param value - Parameter value
 * @param queryParts - Array to collect query string parts
 */
function processQueryParam(key: string, value: unknown, queryParts: string[]): void {
	if (value === undefined || value === null) {
		return
	}

	if (Array.isArray(value)) {
		processArrayParam(key, value, queryParts)
	} else if (typeof value === 'object') {
		processObjectParam(key, value, queryParts)
	} else {
		processSimpleParam(key, value, queryParts)
	}
}

/**
 * Process an array parameter value
 * @param key - Parameter key
 * @param value - Array parameter value
 * @param queryParts - Array to collect query string parts
 */
function processArrayParam(key: string, value: unknown[], queryParts: string[]): void {
	value.forEach((item) => {
		if (item !== undefined && item !== null) {
			queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
		}
	})
}

/**
 * Process an object parameter value
 * @param key - Parameter key
 * @param value - Object parameter value
 * @param queryParts - Array to collect query string parts
 */
function processObjectParam(key: string, value: object, queryParts: string[]): void {
	queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`)
}

/**
 * Process a simple parameter value
 * @param key - Parameter key
 * @param value - Simple parameter value
 * @param queryParts - Array to collect query string parts
 */
function processSimpleParam(key: string, value: unknown, queryParts: string[]): void {
	queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
}

/**
 * Builds a query string from a parameters object
 * @param params - Query parameters object
 */
export function buildQueryString(params: Record<string, unknown>): string {
	if (!params || Object.keys(params).length === 0) {
		return ''
	}

	const queryParts: string[] = []

	for (const [key, value] of Object.entries(params)) {
		processQueryParam(key, value, queryParts)
	}

	return queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
}
