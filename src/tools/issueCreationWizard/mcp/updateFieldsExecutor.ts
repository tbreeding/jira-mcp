/**
 * Update Fields Wizard Tool Executor
 *
 * This file implements the tool executor that validates and updates
 * field values in the Jira Issue Creation Wizard.
 */

import { log } from '../../../utils/logger'
import { WizardStep } from '../types'
import { processFieldsAndState } from './fieldProcessor'
import { createErrorResult, createSuccessResult } from './utils'
import { checkWizardState } from './wizardStateHelpers'
import type { ProcessResult } from './utils'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor, ToolResult } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Convert ProcessResult to ToolResult
 */
function processResultToToolResult(result: ProcessResult): ToolResult {
	if (result.success) {
		return createSuccessResult(result)
	} else {
		return createErrorResult(result.message)
	}
}

/**
 * Creates a tool executor for updating field values
 */
export function updateFieldsWizardToolExecutor(stateManager: StateManager, jiraConfig: JiraApiConfig): ToolExecutor {
	return async function (parameters: { arguments: Record<string, unknown> }) {
		try {
			log(`DEBUG: Received parameters: ${JSON.stringify(parameters)}`)
			// Extract fields safely with type checking
			const args = parameters.arguments || {}

			// Check if fields parameter exists
			if (!args.fields) {
				return createErrorResult('Fields parameter must be an object')
			}

			const fields = args.fields as Record<string, unknown>
			log(`DEBUG: Fields parameter: ${JSON.stringify(fields)}`)
			const validateOnly = Boolean(args.validateOnly)

			if (typeof fields !== 'object') {
				return createErrorResult('Fields parameter must be an object')
			}

			// Check wizard state and get data
			const checkResult = await checkWizardState(stateManager, WizardStep.ISSUE_TYPE_SELECTION)
			log(`DEBUG: Wizard state check result: ${JSON.stringify(checkResult)}`)
			if (!checkResult.success) {
				return createErrorResult(checkResult.errorMessage || 'Failed to verify wizard state')
			}

			// Ensure project and issue type are defined
			if (!checkResult.projectKey || !checkResult.issueTypeId || !checkResult.state) {
				return createErrorResult('Project key, issue type ID, or wizard state is missing')
			}

			// Construct stateInfo using the correct state type directly from checkResult
			const stateInfo = {
				state: checkResult.state, // Use the state directly, assuming it's WizardState
				projectKey: checkResult.projectKey,
				issueTypeId: checkResult.issueTypeId,
			}
			log(`DEBUG: State info: ${JSON.stringify(stateInfo)}`)

			// Process fields and update state
			const processResult = await processFieldsAndState(stateManager, jiraConfig, stateInfo, {
				fields,
				validateOnly,
			})
			log(`DEBUG: Process result: ${JSON.stringify(processResult)}`)
			return processResultToToolResult(processResult)
		} catch (error) {
			return createErrorResult(`Unexpected error: ${(error as Error).message}`)
		}
	}
}
