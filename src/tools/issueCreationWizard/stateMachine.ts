/**
 * Issue Creation Wizard State Machine
 *
 * This module implements a state machine for managing transitions between steps
 * in the Jira Issue Creation Wizard. It ensures that transitions follow the correct
 * sequence and that all required data is present before allowing advancement.
 */

import { createError, createSuccess, ErrorCode } from '../../errors/types'
import { log } from '../../utils/logger'
import { checkStepRequirements, getMissingRequirements } from './stepRequirements'
import { WizardStep, WIZARD_STEP_ORDER } from './types'
import type { WizardState } from './types'
import type { ErrorResult } from '../../errors/types'

/**
 * Defines the allowed transitions between wizard steps
 */
export const ALLOWED_TRANSITIONS: Record<WizardStep, WizardStep[]> = {
	[WizardStep.INITIATE]: [WizardStep.PROJECT_SELECTION],
	[WizardStep.PROJECT_SELECTION]: [WizardStep.INITIATE, WizardStep.ISSUE_TYPE_SELECTION],
	[WizardStep.ISSUE_TYPE_SELECTION]: [WizardStep.PROJECT_SELECTION, WizardStep.FIELD_COMPLETION],
	[WizardStep.FIELD_COMPLETION]: [WizardStep.ISSUE_TYPE_SELECTION, WizardStep.REVIEW],
	[WizardStep.REVIEW]: [WizardStep.FIELD_COMPLETION, WizardStep.SUBMISSION],
	[WizardStep.SUBMISSION]: [WizardStep.REVIEW],
}

/**
 * Checks if a transition from current step to target step is allowed
 */
export function isValidTransition(currentStep: WizardStep, targetStep: WizardStep): boolean {
	if (!ALLOWED_TRANSITIONS[currentStep]) {
		log(`ERROR: No transitions defined for step ${currentStep}`)
		return false
	}
	return ALLOWED_TRANSITIONS[currentStep].includes(targetStep)
}

/**
 * Attempts to transition the state to a new step, checking requirements and validity
 */
export function transitionState(
	currentState: WizardState,
	targetStep: WizardStep,
): { success: true; data: WizardState } | ErrorResult {
	// No change in step
	if (currentState.currentStep === targetStep) {
		return createSuccess({ ...currentState })
	}
	// Check if transition is allowed
	if (!isValidTransition(currentState.currentStep, targetStep)) {
		return createError(
			ErrorCode.INVALID_PARAMETERS,
			`Invalid transition from ${currentState.currentStep} to ${targetStep}`,
		)
	}
	// Going backward is always allowed if the transition is valid
	if (WIZARD_STEP_ORDER[targetStep] < WIZARD_STEP_ORDER[currentState.currentStep]) {
		return createSuccess({
			...currentState,
			currentStep: targetStep,
			timestamp: Date.now(),
		})
	}
	// Going forward requires checking requirements
	if (!checkStepRequirements(currentState, currentState.currentStep)) {
		const missing = getMissingRequirements(currentState, currentState.currentStep)
		return createError(
			ErrorCode.INVALID_PARAMETERS,
			`Cannot advance to ${targetStep} because current step ${currentState.currentStep} is incomplete. Missing: ${missing.join(', ')}`,
		)
	}
	// All checks passed
	return createSuccess({
		...currentState,
		currentStep: targetStep,
		timestamp: Date.now(),
	})
}
