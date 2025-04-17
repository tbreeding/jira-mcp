/**
 * This file provides functionality to update the wizard state in the issue creation process.
 * It handles state transitions between steps, validates changes, and ensures data integrity.
 * Key features include:
 *
 * - Processing step transitions through the state machine
 * - Validating state transitions against business rules
 * - Creating immutable state updates with deep copying
 * - Handling special cases for critical fields
 * - Proper merging of form field data
 */

import { createSuccess } from '../../../errors/types'
import { log } from '../../../utils/logger'
import { transitionState } from '../stateMachine'
import { validateStateTransition } from '../stateValidators'
import type { ErrorResult } from '../../../errors/types'
import type { WizardState, WizardStep } from '../types'

// eslint-disable-next-line custom-rules/enhanced-complexity
export function updateWizardState(
	currentState: WizardState,
	partialState: Partial<WizardState>,
	forceStepTransition = false,
): { success: true; data: WizardState } | ErrorResult {
	// Log the state before update
	log(`DEBUG: Current state before update: ${JSON.stringify(currentState)}`)
	log(`DEBUG: Partial state to apply: ${JSON.stringify(partialState)}, forceStepTransition: ${forceStepTransition}`)

	// Handle step transitions using the state machine
	if (isDifferentState(currentState, partialState)) {
		log(`DEBUG: Processing step transition from ${currentState.currentStep} to ${partialState.currentStep}`)

		// Use the state machine to handle the transition, pass forceStepTransition
		const transitionResult = transitionState(currentState, partialState.currentStep as WizardStep, forceStepTransition)
		if (!transitionResult.success) {
			log(`DEBUG: State transition failed: ${transitionResult.error.message}`)
			return transitionResult
		}

		// Use the transitioned state as our base
		currentState = transitionResult.data
	} else {
		// For non-step transitions, validate using the existing validators

		const validationResult = validateStateTransition(currentState, partialState, forceStepTransition)

		if (!validationResult.success) {
			log(`State transition validation failed: ${validationResult.error.message}`)
			return validationResult
		}
	}

	const updatedState: WizardState = JSON.parse(
		JSON.stringify({
			...currentState,
			...partialState,
			timestamp: Date.now(),
		}),
	)

	if (partialState.projectKey !== undefined) {
		log(
			`DEBUG: Explicitly forcing projectKey from ${currentState.projectKey || 'undefined'} to ${partialState.projectKey}`,
		)
		updatedState.projectKey = partialState.projectKey
	}

	if (partialState.issueTypeId !== undefined) {
		log(
			`DEBUG: Explicitly forcing issueTypeId from ${currentState.issueTypeId || 'undefined'} to ${partialState.issueTypeId}`,
		)
		updatedState.issueTypeId = partialState.issueTypeId
	}

	// Ensure fields are properly updated
	if (partialState.fields) {
		log(`DEBUG: Updating fields`)
		updatedState.fields = {
			...currentState.fields,
			...partialState.fields,
		}
	}

	log(`DEBUG: Final updated state: ${JSON.stringify(updatedState)}`)
	log(`Updated wizard state to step: ${updatedState.currentStep}`)
	return createSuccess(updatedState)
}

function isDifferentState(currentState: WizardState, partialState: Partial<WizardState>): boolean {
	return Boolean(partialState.currentStep && partialState.currentStep !== currentState.currentStep)
}
