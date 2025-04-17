/**
 * Step Transition Validators
 *
 * This module provides helper functions for validating step transitions in the Jira Issue Creation Wizard.
 * It encapsulates logic for checking allowed transitions, skipping steps, and step-specific requirements.
 * Used by stateValidators to keep validation logic modular and maintainable.
 */
import { createError, createSuccess, ErrorCode } from '../../errors/types'
import { log } from '../../utils/logger'
import { WizardStep } from './types'
import type { WizardState } from './types'
import type { ErrorResult } from '../../errors/types'

export function validateStepTransition(
	currentState: WizardState,
	partialState: Partial<WizardState>,
): { success: true; data: boolean } | ErrorResult {
	log(`DEBUG: Processing step transition from ${currentState.currentStep} to ${partialState.currentStep}`)

	if (isStartingWithProjectSection(currentState, partialState)) {
		log(`DEBUG: Allowing explicit INITIATE to PROJECT_SELECTION transition`)
		return createSuccess(true)
	}

	const currentStepIndex = Object.values(WizardStep).indexOf(currentState.currentStep)
	const newStepIndex = Object.values(WizardStep).indexOf(partialState.currentStep as WizardStep)

	log(`DEBUG: Step indices - current: ${currentStepIndex}, new: ${newStepIndex}`)

	if (isSkipStep(currentStepIndex, newStepIndex)) {
		const errorMsg = `Cannot skip from ${currentState.currentStep} to ${partialState.currentStep}`
		log(`DEBUG: Validation failed - ${errorMsg}`)
		return createError(ErrorCode.INVALID_PARAMETERS, errorMsg)
	}

	const requirementsError = getStepRequirementsError(currentState, partialState.currentStep as WizardStep)
	if (requirementsError) {
		return requirementsError
	}

	return createSuccess(true)
}

function isSkipStep(currentStepIndex: number, newStepIndex: number): boolean {
	return newStepIndex > currentStepIndex + 1
}

function getStepRequirementsError(currentState: WizardState, targetStep: WizardStep): ErrorResult | null {
	return validateStepRequirements(currentState, targetStep)
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
