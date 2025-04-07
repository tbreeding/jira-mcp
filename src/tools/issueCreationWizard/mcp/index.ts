/**
 * Issue Creation Wizard Tool Integration
 *
 * This module provides the integrated entry point for the Issue Creation Wizard tools.
 * It combines the tool definitions and executor factories and exports them for
 * registration with the main tool registry. This approach maintains a clean
 * separation of concerns while providing a unified API.
 */

import { analyzeIssueWizardToolExecutor } from './analyzeIssueExecutor'
import { createIssueWizardToolExecutor } from './createIssueExecutor'
import { getFieldsWizardToolExecutor } from './getFieldsExecutor'
import { getIssueTypesWizardToolExecutor } from './getIssueTypesExecutor'
import { getProjectsWizardToolExecutor } from './getProjectsExecutor'
import { getStateWizardToolExecutor } from './getStateExecutor'
import { getStatusWizardToolExecutor } from './getStatusExecutor'
import { initiateStateWizardToolExecutor } from './initiateStateExecutor'
import { resetStateWizardToolExecutor } from './resetStateExecutor'
import { setAnalysisCompleteExecutor } from './setAnalysisCompleteExecutor'
import { setUserConfirmationExecutor } from './setUserConfirmationExecutor'
import { analyzeIssueWizardTool } from './toolDefinitions/analyzeIssueWizardTool'
import { createIssueWizardTool } from './toolDefinitions/createIssueWizardTool'
import { getFieldsWizardTool } from './toolDefinitions/getFieldsWizardTool'
import { getIssueTypesWizardTool } from './toolDefinitions/getIssueTypesWizardTool'
import { getProjectsWizardTool } from './toolDefinitions/getProjectsWizardTool'
import { getStateWizardTool } from './toolDefinitions/getStateWizardTool'
import { getStatusWizardTool } from './toolDefinitions/getStatusWizardTool'
import { initiateStateWizardTool } from './toolDefinitions/initiateStateWizardTool'
import { resetStateWizardTool } from './toolDefinitions/resetStateWizardTool'
import { setAnalysisCompleteWizardTool } from './toolDefinitions/setAnalysisCompleteWizardTool'
import { setUserConfirmationWizardTool } from './toolDefinitions/setUserConfirmationWizardTool'
import { updateFieldsWizardTool } from './toolDefinitions/updateFieldsWizardTool'
import { updateStateWizardTool } from './toolDefinitions/updateStateWizardTool'
import { updateFieldsWizardToolExecutor } from './updateFieldsExecutor'
import { updateStateWizardToolExecutor } from './updateStateExecutor'
import { wrapExecutorWithErrorHandling } from './wrapExecutorWithErrorHandling'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

// Export tool definitions with any enhancements if needed
export const issueCreationWizardTools = {
	getStateWizardTool,
	getStatusWizardTool,
	resetStateWizardTool,
	updateStateWizardTool,
	createIssueWizardTool,
	getProjectsWizardTool,
	getIssueTypesWizardTool,
	getFieldsWizardTool,
	updateFieldsWizardTool,
	initiateStateWizardTool,
	setAnalysisCompleteWizardTool,
	setUserConfirmationWizardTool,
	analyzeIssueWizardTool,
}

/**
 * Creates wrapped tool executors with enhanced error handling for all Issue Creation Wizard tools
 * @param jiraConfig - Jira API configuration needed for issue creation
 * @param stateManager - The state manager instance to use for state operations
 * @returns An object containing all configured tool executors
 */
export function getIssueCreationWizardToolExecutors(
	jiraConfig: JiraApiConfig,
	stateManager: StateManager,
): Record<string, ToolExecutor> {
	return {
		getStateWizardToolExecutor: wrapExecutorWithErrorHandling(getStateWizardToolExecutor(stateManager)),
		getStatusWizardToolExecutor: wrapExecutorWithErrorHandling(getStatusWizardToolExecutor(stateManager)),
		resetStateWizardToolExecutor: wrapExecutorWithErrorHandling(resetStateWizardToolExecutor(stateManager)),
		updateStateWizardToolExecutor: wrapExecutorWithErrorHandling(
			updateStateWizardToolExecutor(stateManager, jiraConfig),
		),
		createIssueWizardToolExecutor: wrapExecutorWithErrorHandling(
			createIssueWizardToolExecutor(stateManager, jiraConfig),
		),
		getProjectsWizardToolExecutor: wrapExecutorWithErrorHandling(getProjectsWizardToolExecutor(jiraConfig)),
		getIssueTypesWizardToolExecutor: wrapExecutorWithErrorHandling(
			getIssueTypesWizardToolExecutor(stateManager, jiraConfig),
		),
		getFieldsWizardToolExecutor: wrapExecutorWithErrorHandling(getFieldsWizardToolExecutor(stateManager, jiraConfig)),
		updateFieldsWizardToolExecutor: wrapExecutorWithErrorHandling(
			updateFieldsWizardToolExecutor(stateManager, jiraConfig),
		),
		initiateStateWizardToolExecutor: wrapExecutorWithErrorHandling(initiateStateWizardToolExecutor(stateManager)),
		setAnalysisCompleteWizardToolExecutor: wrapExecutorWithErrorHandling(setAnalysisCompleteExecutor(stateManager)),
		setUserConfirmationWizardToolExecutor: wrapExecutorWithErrorHandling(setUserConfirmationExecutor(stateManager)),
		analyzeIssueWizardToolExecutor: wrapExecutorWithErrorHandling(analyzeIssueWizardToolExecutor(stateManager)),
	}
}
