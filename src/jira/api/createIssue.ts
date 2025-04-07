/**
 * Create Jira Issue API Function
 *
 * This module provides functionality to create new Jira issues by calling
 * the Jira REST API endpoint. It includes validation of required fields,
 * error handling, and proper response parsing.
 */

import { log } from '../../utils/logger'
import { Failure, Success } from '../../utils/try'
import { callJiraApi, RestMethod } from './callJiraApi'
import { buildCreateIssuePayload } from './createIssuePayload'
import { validateCreateIssueFields } from './issueCreationValidation'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'

/**
 * Interface for create issue request fields
 * These are the fields expected by the createIssue function *before* transformation.
 */
export interface CreateIssueFields {
	summary: string
	issuetype: {
		id?: string
		name?: string
	}
	project: {
		key: string
	}
	description?: unknown // Can be string or potentially pre-formatted ADF
	reporter?: unknown // Can be string ID or object { id: string } or { accountId: string }
	assignee?: unknown // Can be string ID or object { id: string } or { accountId: string }
	[key: string]: unknown
}

/**
 * Interface for create issue response
 */
export interface CreateIssueResponse {
	id: string
	key: string
	self: string
}

/**
 * Creates a new Jira issue with the specified fields
 * @param config Jira API configuration
 * @param fields The issue fields to create the issue with
 * @returns A Result object containing either the new issue information or an error
 */
export async function createIssue(config: JiraApiConfig, fields: CreateIssueFields): Promise<Try<CreateIssueResponse>> {
	const validationError = validateCreateIssueFields(fields)
	if (validationError) {
		log(`ERROR: Invalid issue creation fields: ${validationError}`)
		return Promise.resolve(Failure(new Error(validationError)))
	}

	const requestBody = buildCreateIssuePayload(fields)

	log(
		`DEBUG: Submitting Jira issue creation with request structure: ${JSON.stringify({
			config,
			endpoint: '/rest/api/3/issue',
			method: RestMethod.POST,
			body: requestBody,
		})}`,
	)

	// Make the API call to create the issue
	const { error: callApiError, value } = await callJiraApi<typeof requestBody, CreateIssueResponse>({
		config,
		endpoint: '/rest/api/3/issue',
		method: RestMethod.POST,
		body: requestBody,
	})

	if (callApiError) {
		log(`ERROR: Failed to create issue: ${callApiError.message}`)
		return Failure(callApiError)
	}

	return Success(value)
}
