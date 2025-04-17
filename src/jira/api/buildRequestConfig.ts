/**
 * Jira API request config builder
 * This utility builds the RequestInit object for Jira API calls.
 * It is extracted to keep callJiraApi.ts under 100 lines and to
 * encapsulate the logic for authentication, headers, and body formatting.
 * Used by all Jira API HTTP methods to ensure consistency and testability.
 */
export function buildRequestConfig<TRequestBody>(auth: string, method: string, body?: TRequestBody): RequestInit {
	const request: RequestInit = {
		method,
		headers: {
			Authorization: `Basic ${auth}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
	}

	// Add body for non-GET requests
	if (body && method !== 'GET') {
		request.body = JSON.stringify(body)
	}

	return request
}
