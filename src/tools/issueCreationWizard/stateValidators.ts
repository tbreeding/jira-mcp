/**
 * Issue Creation Wizard State Validators
 *
 * This module provides validation functions for the Jira Issue Creation Wizard state.
 * It ensures that state transitions are valid and all required data is present
 * before allowing transitions between steps.
 */

import { createError, createSuccess, ErrorCode } from '../../errors/types'
import { log } from '../../utils/logger'
import { WizardStep } from './types'
import type { WizardState } from './types'
import type { ErrorResult } from '../../errors/types'

export function validateStateTransition(
	currentState: WizardState,
	partialState: Partial<WizardState>,
): { success: true; data: boolean } | ErrorResult {
	log(`DEBUG: Validating state transition: current=${currentState.currentStep}, update=${JSON.stringify(partialState)}`)

	// Early return for trivial updates with no step change
	if (!partialState.currentStep) {
		log(`DEBUG: No step change requested, allowing update`)
		return createSuccess(true)
	}

	// If trying to change step, validate the transition
	if (isStepTransition(currentState, partialState)) {
		log(`DEBUG: Processing step transition from ${currentState.currentStep} to ${partialState.currentStep}`)

		// If transitioning from INITIATE to PROJECT_SELECTION, always allow it
		if (isStartingWithProjectSection(currentState, partialState)) {
			log(`DEBUG: Allowing explicit INITIATE to PROJECT_SELECTION transition`)
			return createSuccess(true)
		}

		const currentStepIndex = Object.values(WizardStep).indexOf(currentState.currentStep)
		const newStepIndex = Object.values(WizardStep).indexOf(partialState.currentStep as WizardStep)

		log(`DEBUG: Step indices - current: ${currentStepIndex}, new: ${newStepIndex}`)

		// Only allow moving to the next step or backwards
		if (newStepIndex > currentStepIndex + 1) {
			const errorMsg = `Cannot skip from ${currentState.currentStep} to ${partialState.currentStep}`
			log(`DEBUG: Validation failed - ${errorMsg}`)
			return createError(ErrorCode.INVALID_PARAMETERS, errorMsg)
		}

		// Validate step-specific requirements
		const requirementsError = validateStepRequirements(currentState, partialState.currentStep as WizardStep)
		if (requirementsError) {
			return requirementsError
		}
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

function validateStepRequirements(currentState: WizardState, targetStep: WizardStep): ErrorResult | null {
	log(`DEBUG: Validating requirements for transition to ${targetStep}`)

	switch (targetStep) {
		case WizardStep.ISSUE_TYPE_SELECTION:
			if (!currentState.projectKey) {
				log(`DEBUG: Validation failed - missing projectKey for transition to ISSUE_TYPE_SELECTION`)
				return createError(ErrorCode.INVALID_PARAMETERS, 'Must select a project before choosing issue type')
			}
			break
		case WizardStep.FIELD_COMPLETION:
			if (!currentState.issueTypeId) {
				log(`DEBUG: Validation failed - missing issueTypeId for transition to FIELD_COMPLETION`)
				return createError(ErrorCode.INVALID_PARAMETERS, 'Must select an issue type before completing fields')
			}
			break
	}

	log(`DEBUG: Requirements validation passed for transition to ${targetStep}`)
	return null
}

function isStartingWithProjectSection(currentState: WizardState, partialState: Partial<WizardState>): boolean {
	return Boolean(
		currentState.currentStep === WizardStep.INITIATE && partialState.currentStep === WizardStep.PROJECT_SELECTION,
	)
}
