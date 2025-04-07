/**
 * Jira issue retrieval functionality
 *
 * This file implements the API calls required to fetch detailed information
 * about Jira issues. It provides the core functionality for retrieving issue
 * data including fields, status, and other related information.
 */

import { log } from '../../utils/logger'
import { Failure, Success } from '../../utils/try'
import { callJiraApi, RestMethod } from './callJiraApi'
import getAllChangeLogsForIssue from './issueChangeLogs/getAllChangeLogsForIssue'
import { hasCompleteChangeLog } from './issueChangeLogs/hasCompleteChangeLog'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'
import type { JiraIssue } from '../types/issue.types'

export async function getIssueByKey(issueKey: string, config: JiraApiConfig): Promise<Try<JiraIssue>> {
	const { error, value: issue } = await callJiraApi<Record<string, never>, JiraIssue>({
		config,
		endpoint: `/rest/api/3/issue/${issueKey}?expand=changelog`,
		method: RestMethod.GET,
	})

	// If the API call failed, return the error
	if (error) {
		return Failure(error)
	}

	const typedIssue = issue as JiraIssue
	log(`DEBUG: getIssueByKey response: ${JSON.stringify(Object.keys(typedIssue))}`)

	// Check if we need to fetch the complete changelog
	if (hasCompleteChangeLog(typedIssue.changelog)) return Success(typedIssue)

	const { error: getAllChangeLogsError, value: changeLogs } = await getAllChangeLogsForIssue(issueKey, config)
	if (getAllChangeLogsError) {
		return Failure(getAllChangeLogsError)
	}

	return Success({
		...typedIssue,
		changelog: {
			startAt: 0,
			maxResults: changeLogs.length,
			total: changeLogs.length,
			histories: changeLogs,
		},
	})
}
