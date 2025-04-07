/**
 * Factory for creating Jira issue changelog retrieval functions
 *
 * This file provides a factory function that creates specialized functions for
 * retrieving issue changelogs. It handles pagination, authentication, and data
 * formatting to provide consistent access to historical issue changes.
 */

import { Failure, Success } from '../../../utils/try'
import { callJiraApi, RestMethod } from '../callJiraApi'
import type Try from '../../../utils/try'
import type { IssueChangeLogResponseBody } from '../../types/issue.types'
import type { JiraApiConfig } from '../apiTypes'

export default function createGetIssueChangeLogs(config: JiraApiConfig, issueIdOrKey: string) {
	return async function getIssueChangeLogs(startAt = 0, maxResults = 50): Promise<Try<IssueChangeLogResponseBody>> {
		const { value: results, error } = await callJiraApi<Record<string, never>, IssueChangeLogResponseBody>({
			endpoint: `/rest/api/3/issue/${issueIdOrKey}/changelog?maxResults=${maxResults}&startAt=${startAt}`,
			method: RestMethod.GET,
			config: config,
		})

		if (error) {
			return Failure(error)
		}

		return Success(results as IssueChangeLogResponseBody)
	}
}
