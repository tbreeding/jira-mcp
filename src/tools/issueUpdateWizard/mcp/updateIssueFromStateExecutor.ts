/**
 * Update Issue From State Tool Executor
 *
 * This module implements the execution function for the updateIssueFromState tool.
 * It updates a Jira issue based on the current wizard state.
 */

import { createSuccessResult, createErrorResult } from '../../issueCreationWizard/mcp/utils'
import { updateIssueFromState } from '../operations/updateIssueOrchestrator'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../../issueCreationWizard/stateManager'

/**
 * Creates an executor that updates a Jira issue using the current state
 * @param stateManager - The state manager instance to use
 * @param jiraConfig - The Jira API configuration
 */
export function updateIssueFromStateToolExecutor(stateManager: StateManager, jiraConfig: JiraApiConfig): ToolExecutor {
	return async function (): Promise<ReturnType<typeof createSuccessResult>> {
		try {
			// Execute the update operation
			const result = await updateIssueFromState(stateManager, jiraConfig)

			if (!result.success) {
				return createErrorResult(result.error.message)
			}

			// Return a success response with the issue key
			return createSuccessResult({
				success: true,
				message: `Successfully updated issue ${result.value}`,
				issueKey: result.value,
			})
		} catch (error) {
			return createErrorResult((error as Error).message)
		}
	}
}
