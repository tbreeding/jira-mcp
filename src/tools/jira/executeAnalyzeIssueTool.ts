/**
 * Jira Issue Analysis Tool Execution Module
 *
 * This module contains the core execution logic for the Jira issue analysis tool.
 * It handles fetching issue data, retrieving comments, performing analysis, and
 * formatting the results for the caller. Error handling is implemented to gracefully
 * handle API failures and other exceptions.
 */

import { getIssueByKey } from '../../jira/api/getIssue'
import { getIssueComments } from '../../jira/api/getIssueComments'
import { analyzeIssue } from '../../jira/services/analyzeIssue/analyzeIssue'
import { log } from '../../utils/logger'
import type { JiraApiConfig } from '../../jira/api/apiTypes'
import type { IssueAnalysisResult } from '../../jira/services/analyzeIssue/analyzeIssue.types'
import type { ToolResult } from '../../types'

/**
 * Execute the analyzeJiraIssue tool
 * @param parameters The tool parameters
 * @param jiraConfig The Jira API configuration
 * @returns The tool execution result
 */
export async function executeAnalyzeIssueTool(
	parameters: { arguments: { issueKey: string } },
	jiraConfig: JiraApiConfig,
): Promise<ToolResult> {
	log(`DEBUG: analyzeJiraIssue tool parameters: ${JSON.stringify(parameters)}`)
	const issueKey = parameters.arguments.issueKey
	log(`DEBUG: analyzeJiraIssue tool parameters - issueKey: ${issueKey}`)

	// Get pre-fetched issue or issue key
	const { error: getIssueError, value: issue } = await getIssueByKey(issueKey, jiraConfig)
	if (getIssueError) {
		log(`ERROR: Failed to get issue: ${getIssueError.message}`)
		return {
			content: [{ type: 'text', text: `Error: ${getIssueError.message}` }],
			isError: true,
		}
	}

	const { error: getCommentsError, value: comments } = await getIssueComments(issueKey, jiraConfig)
	if (getCommentsError) {
		log(`ERROR: Failed to get comments: ${getCommentsError.message}`)
		return {
			content: [{ type: 'text', text: `Error: ${getCommentsError.message}` }],
			isError: true,
		}
	}

	log(`DEBUG: issue: ${JSON.stringify(issue)}`)
	log(`DEBUG: comments: ${JSON.stringify(comments)}`)

	// First stage: Perform initial analysis
	const analysisResult = analyzeIssue(issue, comments) as IssueAnalysisResult

	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify({
					success: true,
					data: analysisResult,
				}),
			},
		],
	}
}
