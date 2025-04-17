/**
 * MCP Tool Executor: Load Issue Into State
 *
 * Implements the logic for the issueUpdateWizard_loadIssueIntoState tool.
 * Fetches a Jira issue by key and loads it into the state manager for unified update workflows.
 */

import { ErrorCode } from '../../../errors/types'
import { getIssueByKey } from '../../../jira/api/getIssue'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../../issueCreationWizard/stateManager'

export function loadIssueIntoStateExecutor(stateManager: StateManager, jiraConfig: JiraApiConfig): ToolExecutor {
	return async function (parameters: { arguments: Record<string, unknown> }) {
		const issueKey = parameters.arguments.issueKey as string | undefined
		if (!issueKey) {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({
							success: false,
							error: {
								code: ErrorCode.INVALID_PARAMETERS,
								message: 'issueKey is required',
							},
						}),
					},
				],
				isError: true,
			}
		}
		const { error, value: issue } = await getIssueByKey(issueKey, jiraConfig)
		if (error) {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({
							success: false,
							error: {
								code: ErrorCode.TOOL_EXECUTION_ERROR,
								message: error.message,
							},
						}),
					},
				],
				isError: true,
			}
		}
		const result = stateManager.loadIssueState(issue)
		if (!result.success) {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ success: false, error: result.error }),
					},
				],
				isError: true,
			}
		}
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify({ success: true, state: result.data }),
				},
			],
			isError: false,
		}
	}
}
