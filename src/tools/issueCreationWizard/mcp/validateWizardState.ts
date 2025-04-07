/**
 * Wizard State Validation
 *
 * This module provides a function to validate the state of the issue creation wizard.
 * It checks for an active wizard session and ensures essential fields like
 * projectKey and issueTypeId are present before proceeding with issue creation.
 */
import { log } from '../../../utils/logger'
import { createErrorResult } from './utils'
import type { StateManager } from '../stateManager'
import type { WizardState } from '../types' // Import WizardState from types

/**
 * Validates the wizard state for issue creation.
 * Returns the validated state or an error result.
 */
export function validateWizardState(
	stateResult: ReturnType<StateManager['getState']>,
): { success: true; data: WizardState } | { success: false; errorResult: ReturnType<typeof createErrorResult> } {
	// Log state retrieval result
	if (stateResult.success) {
		const state = stateResult.data
		const stateMsg =
			`projectKey=${state.projectKey}, issueTypeId=${state.issueTypeId}, ` +
			`step=${state.currentStep}, fieldsCount=${Object.keys(state.fields || {}).length}`
		log(`Current wizard state: ${stateMsg}`)
		log(`DEBUG: Full state: ${JSON.stringify(state)}`)
	}

	// Make sure we have an active wizard
	if (!stateResult.success) {
		log(`Failed to retrieve wizard state: ${stateResult.error.message}`)
		return { success: false, errorResult: createErrorResult('No active issue creation wizard found') }
	}

	const currentState = stateResult.data

	// Make sure we have all required fields
	if (!currentState.projectKey || !currentState.issueTypeId) {
		log(
			`ERROR: Missing required fields - projectKey: ${currentState.projectKey}, issueTypeId: ${currentState.issueTypeId}`,
		)
		return {
			success: false,
			errorResult: createErrorResult('Project and issue type are required for issue creation'),
		}
	}

	return { success: true, data: currentState }
}
