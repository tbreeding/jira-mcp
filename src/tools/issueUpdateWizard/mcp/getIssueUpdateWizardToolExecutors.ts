/**
 * Issue Update Wizard Tool Integration
 *
 * This module provides the integrated entry point for the Issue Update Wizard tools.
 * It combines the tool definitions and executor factories and exports them for
 * registration with the main tool registry.
 */

import { wrapExecutorWithErrorHandling } from '../../issueCreationWizard/mcp/wrapExecutorWithErrorHandling'
import { loadIssueIntoStateExecutor } from './loadIssueIntoStateExecutor'
import { updateIssueFromStateToolExecutor } from './updateIssueFromStateExecutor'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../../issueCreationWizard/stateManager'

/**
 * Creates wrapped tool executors with enhanced error handling for all Issue Update Wizard tools
 * @param jiraConfig - Jira API configuration needed for issue operations
 * @param stateManager - The state manager instance to use for state operations
 * @returns An object containing all configured tool executors
 */
export function getIssueUpdateWizardToolExecutors(
	jiraConfig: JiraApiConfig,
	stateManager: StateManager,
): Record<string, ToolExecutor> {
	return {
		updateIssueFromStateToolExecutor: wrapExecutorWithErrorHandling(
			updateIssueFromStateToolExecutor(stateManager, jiraConfig),
		),
		loadIssueIntoStateToolExecutor: wrapExecutorWithErrorHandling(loadIssueIntoStateExecutor(stateManager, jiraConfig)),
	}
}
