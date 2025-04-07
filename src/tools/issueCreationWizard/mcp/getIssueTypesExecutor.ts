/**
 * Issue Creation Wizard GetIssueTypes Tool Executor
 *
 * This module implements the execution function for the getIssueTypes tool.
 * It retrieves available Jira issue types for the selected project in the wizard.
 */

import { getIssueTypes } from '../../../jira/api/getIssueTypesFunction'
import { WizardStep } from '../types'
import { createSuccessResult, createErrorResult } from './utils'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

export function getIssueTypesWizardToolExecutor(stateManager: StateManager, jiraConfig: JiraApiConfig): ToolExecutor {
	return async function (parameters: {
		arguments: Record<string, unknown>
	}): Promise<ReturnType<typeof createSuccessResult>> {
		try {
			const stateResult = stateManager.getState()

			if (!stateResult.success) {
				return createErrorResult(`Failed to get wizard state: ${stateResult.error.message}`)
			}

			const { projectKey, currentStep } = stateResult.data

			// Validate that we have a project key and are at the correct step
			if (!projectKey) {
				return createErrorResult('No project has been selected. Please select a project first.')
			}

			if (currentStep < WizardStep.PROJECT_SELECTION) {
				return createErrorResult('Please complete project selection first.')
			}

			// Extract parameters from the arguments object
			const args = parameters.arguments || {}
			const forceRefresh = Boolean(args.forceRefresh)

			// Call the Jira API to retrieve issue types for the selected project
			const result = await getIssueTypes(projectKey, jiraConfig, forceRefresh)

			if (!result.success) {
				return createErrorResult(`Failed to retrieve issue types: ${result.error.message}`)
			}

			// Return the issue types in a format suitable for selection
			const issueTypes = result.value.map(function (issueType) {
				return {
					id: issueType.id,
					name: issueType.name,
					description: issueType.description || '',
					iconUrl: issueType.iconUrl,
					subtask: issueType.subtask,
				}
			})

			return createSuccessResult({
				success: true,
				message: `Retrieved ${issueTypes.length} issue types for project ${projectKey}`,
				issueTypes,
				projectKey,
			})
		} catch (error) {
			return createErrorResult((error as Error).message)
		}
	}
}
