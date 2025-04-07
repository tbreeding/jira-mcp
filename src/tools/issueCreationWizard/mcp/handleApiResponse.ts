/**
 * Handles the response from the Jira API createIssue call.
 *
 * Creates either a success result with issue details or an error result.
 */
import { log } from '../../../utils/logger'
import { createSuccessResult, createErrorResult } from './utils'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { CreateIssueFields, CreateIssueResponse } from '../../../jira/api/createIssue'
import type Try from '../../../utils/try'

/**
 * Represents the data returned on successful issue creation.
 */
type SuccessResultData = {
	success: true
	issueKey: string
	summary: string
	url: string
}

/**
 * Handles the response from the Jira API createIssue call.
 */
export function handleApiResponse(
	apiResult: Try<CreateIssueResponse>,
	issueData: CreateIssueFields,
	jiraConfig: JiraApiConfig,
): ReturnType<typeof createSuccessResult | typeof createErrorResult> {
	if (apiResult.success) {
		log(`Issue creation successful: ${apiResult.value.key}`)
		log(`DEBUG: Full API response: ${JSON.stringify(apiResult.value)}`)

		const successResultData: SuccessResultData = {
			success: true,
			issueKey: apiResult.value.key,
			summary: issueData.summary,
			url: `${jiraConfig.baseUrl}/browse/${apiResult.value.key}`,
		}
		log(`Returning success result: ${JSON.stringify(successResultData)}`)
		return createSuccessResult(successResultData)
	} else {
		log(`ERROR: Issue creation failed: ${apiResult.error.message}`)
		log(`DEBUG: Error details: ${JSON.stringify(apiResult.error)}`)
		return createErrorResult(`Failed to create issue: ${apiResult.error.message}`)
	}
}
