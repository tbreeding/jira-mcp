/**
 * Comprehensive Jira issue changelog retrieval
 *
 * This file implements functionality for retrieving the complete history of
 * changes for a Jira issue. It handles pagination, data aggregation, and
 * provides a consistent interface for accessing historical change data.
 */

import { Failure, Success } from '../../../utils/try'
import generateChangeLogsForIssue from './generateChangeLogsForIssue'
import type Try from '../../../utils/try'
import type { IssueChangeLogEntry } from '../../types/issue.types'
import type { JiraApiConfig } from '../apiTypes'

export default async function getAllChangeLogsForIssue(
	issueIdOrKey: string,
	jiraConfig: JiraApiConfig,
): Promise<Try<IssueChangeLogEntry[]>> {
	const changeLogs = []

	for await (const { error, value: changeLog } of generateChangeLogsForIssue(issueIdOrKey, jiraConfig)) {
		if (error) return Failure(error)

		changeLogs.push(changeLog)
	}

	return Success(changeLogs)
}
