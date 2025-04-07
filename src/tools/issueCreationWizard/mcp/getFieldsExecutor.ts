/**
 * Get Fields Executor
 *
 * This file implements the tool executor that retrieves field definitions
 * from the Jira API and returns them for use in the Issue Creation Wizard.
 * It's used to get available fields for a specific project and issue type,
 * which allows users to see what information they need to provide when
 * creating a new issue.
 */

import { getAndCategorizeFields } from '../../../jira/api/getAndCategorizeFields'
import { getProjectByKey } from '../../../jira/api/getProjects'
import { WizardStep } from '../types'
import { createSuccessResult, createErrorResult } from './utils'
import { checkWizardState } from './wizardStateHelpers'
import type { WizardStateResult } from './wizardStateHelpers'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Creates a tool executor for getting available fields
 */
export function getFieldsWizardToolExecutor(stateManager: StateManager, jiraConfig: JiraApiConfig): ToolExecutor {
	// Even though we're currently not using the parameters, we should still extract them correctly
	return async function (parameters: Record<string, unknown>) {
		try {
			// Fix: Extract parameters from the arguments object instead of directly from parameters
			// Not actively using parameters now, but still fixing for consistency and future use

			const _args = (parameters.arguments as Record<string, unknown>) || {}

			// Check wizard state and get project/issue type IDs
			const checkResult = await checkWizardState(stateManager, WizardStep.ISSUE_TYPE_SELECTION)
			if (!checkResult.success) {
				return createErrorResult(checkResult.errorMessage as Required<WizardStateResult>['errorMessage'])
			}

			const { projectKey, issueTypeId } = checkResult

			// Ensure both keys are defined
			if (!projectKey || !issueTypeId) {
				return createErrorResult('Project key or issue type ID is missing')
			}

			// Get project ID from project key
			const projectResult = await getProjectByKey(projectKey, jiraConfig)
			if (!projectResult.success) {
				return createErrorResult(`Failed to retrieve project information: ${projectResult.error.message}`)
			}

			const projectId = projectResult.value.id

			// Call Jira API to get field metadata
			const result = await getAndCategorizeFields(projectKey, projectId, issueTypeId, jiraConfig)

			if (!result.success) {
				return createErrorResult(`Failed to retrieve fields: ${result.error.message}`)
			}

			// Return success with the field data
			return createSuccessResult({
				success: true,
				message: 'Fields retrieved successfully',
				fields: result.value,
			})
		} catch (error) {
			return createErrorResult(`Unexpected error: ${(error as Error).message}`)
		}
	}
}
