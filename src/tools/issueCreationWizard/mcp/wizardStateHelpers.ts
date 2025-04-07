/**
 * Wizard State Helpers
 *
 * Utility functions for managing and validating the state of the Jira Issue Creation Wizard.
 * Includes functions to check if the wizard is in a valid state for operations,
 * verify required steps have been completed, and extract relevant data.
 * The primary function is checkWizardState which validates that the wizard is active
 * and has progressed to at least a specific step in the wizard flow.
 */

import { isStepAtOrBeyond } from '../types'
import type { StateManager } from '../stateManager'
import type { WizardStep, WizardState } from '../types'

export interface WizardStateResult {
	success: boolean
	errorMessage?: string
	state?: WizardState
	projectKey?: string
	issueTypeId?: string
}

/**
 * Checks that the wizard state is valid and at or beyond the required step
 */
export async function checkWizardState(
	stateManager: StateManager,
	requiredStep: WizardStep,
): Promise<WizardStateResult> {
	const stateResult = stateManager.getState()

	// Check if wizard is active
	if (!stateResult.success || !stateResult.data.active) {
		return {
			success: false,
			errorMessage: 'No active wizard. Initialize one first.',
		}
	}

	// Check if we have reached the required step
	if (!isStepAtOrBeyond(stateResult.data.currentStep, requiredStep)) {
		return {
			success: false,
			errorMessage: 'Previous steps must be completed first.',
		}
	}

	// Check if we have project and issue type selected
	if (!stateResult.data.projectKey || !stateResult.data.issueTypeId) {
		return {
			success: false,
			errorMessage: 'Project and issue type must be selected.',
		}
	}

	// Return success with state data
	return {
		success: true,
		state: stateResult.data,
		projectKey: stateResult.data.projectKey,
		issueTypeId: stateResult.data.issueTypeId,
	}
}
