/**
 * Issue Creation Wizard CreateIssue Tool Executor
 *
 * This module implements the execution function for the createIssue tool.
 * It creates a Jira issue using the current wizard state.
 */

import { createIssue } from '../../../jira/api/createIssue'
import { log } from '../../../utils/logger'
import { handleApiResponse } from './handleApiResponse'
import { prepareIssuePayload } from './prepareIssuePayload'
import { createErrorResult, type createSuccessResult } from './utils'
import { validateWizardState } from './validateWizardState'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * The core logic for creating a Jira issue from the wizard state.
 * This function is returned by createIssueWizardToolExecutor.
 */
async function executeIssueCreation(
	stateManager: StateManager,
	jiraConfig: JiraApiConfig,
): Promise<ReturnType<typeof createSuccessResult | typeof createErrorResult>> {
	log(`executeIssueCreation: Creating issue from wizard state`)
	try {
		// 1. Get and Validate State
		log(`Getting current wizard state`)
		const stateResult = stateManager.getState()
		const validationResult = validateWizardState(stateResult)

		if (!validationResult.success) {
			return validationResult.errorResult
		}
		const currentState = validationResult.data

		// NEW: Check if analysis is complete
		if (!currentState.analysisComplete) {
			log('ERROR: Issue analysis not completed')
			return createErrorResult('Issue analysis must be completed before creating the issue. Please run analysis first.')
		}

		// NEW: Check for user confirmation
		if (!currentState.userConfirmation) {
			log('ERROR: User confirmation not obtained')
			return createErrorResult(
				"User confirmation is required before creating the issue. Please ask the user if it's OK to proceed.",
			)
		}

		// 2. Prepare Payload
		const issueData = prepareIssuePayload(currentState)

		// 3. Create Issue via API
		log(`Calling Jira API via createIssue for project ${currentState.projectKey}`)
		const apiResult = await createIssue(jiraConfig, issueData)

		// 4. Handle API Response
		return handleApiResponse(apiResult, issueData, jiraConfig)
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		const stackTrace = error instanceof Error ? error.stack : 'No stack trace available'
		log(`ERROR in executeIssueCreation: ${errorMessage}`)
		log(`ERROR stack trace: ${stackTrace}`)
		return createErrorResult(`Unexpected error during issue creation: ${errorMessage}`)
	}
}

/**
 * Factory function to create the issue creation tool executor.
 * It sets up the executor with necessary dependencies (state manager, Jira config).
 */
export function createIssueWizardToolExecutor(stateManager: StateManager, jiraConfig: JiraApiConfig): ToolExecutor {
	// Return the actual executor function, closing over dependencies
	return () => executeIssueCreation(stateManager, jiraConfig)
}
