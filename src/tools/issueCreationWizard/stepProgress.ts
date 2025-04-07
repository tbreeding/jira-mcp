/**
 * Issue Creation Wizard Step Progress
 *
 * This module provides functions for tracking wizard progress and determining
 * next steps in the wizard flow.
 */

import { checkStepRequirements } from './stepRequirements'
import { WizardStep, WIZARD_STEP_ORDER } from './types'
import type { WizardState } from './types'

/**
 * Gets the next step in the wizard sequence
 */
export function getNextStep(currentStep: WizardStep): WizardStep | null {
	const currentIndex = WIZARD_STEP_ORDER[currentStep]
	const steps = Object.values(WizardStep)

	// Find the step with the next index
	for (const step of steps) {
		if (WIZARD_STEP_ORDER[step] === currentIndex + 1) {
			return step
		}
	}

	return null
}

/**
 * Gets the previous step in the wizard sequence
 */
export function getPreviousStep(currentStep: WizardStep): WizardStep | null {
	const currentIndex = WIZARD_STEP_ORDER[currentStep]
	const steps = Object.values(WizardStep)

	// Find the step with the previous index
	for (const step of steps) {
		if (WIZARD_STEP_ORDER[step] === currentIndex - 1) {
			return step
		}
	}

	return null
}

/**
 * Calculates the overall progress percentage of the wizard
 */
export function calculateWizardProgress(state: WizardState): number {
	// Return 0 specifically for INITIATE step
	if (state.currentStep === WizardStep.INITIATE) {
		return 0
	}

	const totalSteps = Object.keys(WizardStep).length
	const currentStepIndex = WIZARD_STEP_ORDER[state.currentStep]

	// Base progress is the current step divided by total steps
	let progress = (currentStepIndex / (totalSteps - 1)) * 100

	// Adjust for completion of current step
	if (checkStepRequirements(state, state.currentStep)) {
		// If current step is complete, add partial credit for this step
		const stepValue = 100 / (totalSteps - 1)
		progress += stepValue * 0.5
	}

	return Math.min(Math.round(progress), 100)
}
