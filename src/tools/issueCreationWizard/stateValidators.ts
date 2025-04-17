/**
 * Issue Creation Wizard State Validators
 *
 * This module provides validation functions for the Jira Issue Creation Wizard state.
 * It ensures that state transitions are valid and all required data is present
 * before allowing transitions between steps.
 */

import { createSuccess } from '../../errors/types'
import { log } from '../../utils/logger'
import { validateStepTransition } from './stepTransitionValidators'
import type { WizardState } from './types'
import type { ErrorResult } from '../../errors/types'

export function validateStateTransition(
	currentState: WizardState,
	partialState: Partial<WizardState>,
	forceStepTransition = false,
): { success: true; data: boolean } | ErrorResult {
	if (forceStepTransition) return createSuccess(true)

	log(`DEBUG: Validating state transition: current=${currentState.currentStep}, update=${JSON.stringify(partialState)}`)

	if (!partialState.currentStep) {
		log(`DEBUG: No step change requested, allowing update`)
		return createSuccess(true)
	}

	if (isStepTransition(currentState, partialState)) {
		return validateStepTransition(currentState, partialState)
	}

	log(`DEBUG: State transition validation passed`)
	return createSuccess(true)
}

function isStepTransition(currentState: WizardState, partialState: Partial<WizardState>): boolean {
	const isTransition = Boolean(partialState.currentStep && partialState.currentStep !== currentState.currentStep)
	log(
		`DEBUG: Checking if this is a step transition: ${isTransition} (current=${currentState.currentStep}, new=${partialState.currentStep})`,
	)
	return isTransition
}
