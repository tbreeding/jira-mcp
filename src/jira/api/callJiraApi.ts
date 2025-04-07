/**
 * Jira API request execution functionality
 *
 * This file provides the core functionality for making HTTP requests to the
 * Jira API. It handles authentication, request formatting, error handling,
 * and response parsing for all API interactions.
 */

import { log } from '../../utils/logger'
import { Failure, Success } from '../../utils/try'
import { handleApiError } from './apiUtils'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'

export enum RestMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	PATCH = 'PATCH',
}

interface JiraApiCallOptions<TRequestBody extends Record<string, unknown>> {
	config: JiraApiConfig
	endpoint: string
	method: RestMethod
	body?: TRequestBody
}

/**
 * Builds a request configuration for a Jira API call
 */
function buildRequestConfig<TRequestBody>(auth: string, method: string, body?: TRequestBody): RequestInit {
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

/**
 * Generic function to call any Jira API endpoint
 * @param options The API call options including endpoint, config, method and optional body
 * @returns A Result object containing either the response data or an error
 */
export async function callJiraApi<TBody extends Record<string, unknown>, TResponse>({
	config,
	endpoint,
	method,
	body,
}: JiraApiCallOptions<TBody>): Promise<Try<TResponse>> {
	const { baseUrl, username, apiToken } = config

	// Create the authorization header using Basic Auth
	const auth = Buffer.from(`${username}:${apiToken}`).toString('base64')

	// Construct the full API URL
	const url = `${baseUrl}${endpoint}`
	log(`DEBUG: Calling ${method} ${url}`)
	try {
		// Build and make the API request
		const requestConfig = buildRequestConfig(auth, method, body)
		const response = await fetch(url, requestConfig)

		// Log response status for debugging
		log(`DEBUG: Response status for ${method} ${endpoint}: ${response.status} ${response.statusText}`)

		// If the response is not ok, return an error
		if (!response.ok) {
			return handleApiError(response, `Failed to ${method} ${endpoint}`)
		}

		// Get the response body as JSON
		const data = await response.json()

		// Return the successful response
		return Success(data as TResponse)
	} catch (error) {
		// Handle any network or other errors

		log(`ERROR: Exception while calling ${method} ${endpoint}`, error as Error)

		return Failure(error as Error)
	}
}
