/**
 * Jira issue comments retrieval functionality
 *
 * This file implements the API calls needed to fetch comments associated with
 * Jira issues. It handles authentication, request formatting, and provides
 * structured access to comment data for analysis.
 */

import { callJiraApi, RestMethod } from './callJiraApi'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'
import type { IssueCommentResponse } from '../types/comment'

/**
 * Fetches all comments for a Jira issue
 * @param issueKey The key of the Jira issue to fetch comments for (e.g., 'PROJ-123')
 * @param config Jira API configuration
 * @returns A Result object containing either the comments data or an error
 */
export function getIssueComments(issueKey: string, config: JiraApiConfig): Promise<Try<IssueCommentResponse>> {
	return callJiraApi<Record<string, never>, IssueCommentResponse>({
		config,
		endpoint: `/rest/api/3/issue/${issueKey}/comment`,
		method: RestMethod.GET,
	})
}
