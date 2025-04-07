/**
 * Jira issue changelog generation utilities
 *
 * This file provides functionality for generating and processing changelogs for
 * Jira issues. It handles the retrieval and transformation of raw changelog data
 * into a structured format that can be used for issue analysis and tracking.
 */

import { Success, Failure } from '../../../utils/try'
import createGetIssueChangeLogs from './createGetIssueChangeLogs'
import type Try from '../../../utils/try'
import type { IssueChangeLogEntry } from '../../types/issue.types'
import type { JiraApiConfig } from '../apiTypes'

export default async function* generateChangeLogsForIssue(
	issueIdOrKey: string,
	config: JiraApiConfig,
): AsyncGenerator<Try<IssueChangeLogEntry>, void, unknown> {
	const getIssueChangeLogs = createGetIssueChangeLogs(config, issueIdOrKey)
	const maxResults = 50
	let shouldContinue = true
	let nextStartAt = 0

	do {
		const { error, value } = await getIssueChangeLogs(nextStartAt, maxResults)

		if (error) {
			yield Failure(error)
			return
		}

		const { startAt, values: changeLogs, isLast } = value
		if (!changeLogs?.length) break

		shouldContinue = !isLast
		nextStartAt = startAt + maxResults

		for (const changeLog of changeLogs) {
			yield Success(changeLog)
		}
	} while (shouldContinue)
}
