/**
 * This file defines the initializeWizardState function which creates and returns
 * a new wizard state object with default values. The function initializes the
 * issue creation wizard state with essential properties including:
 *
 * - Setting the wizard as active
 * - Setting the current step to INITIATE
 * - Initializing empty fields object
 * - Creating empty validation structures
 * - Setting a creation timestamp
 *
 * This provides a clean starting point for the issue creation process.
 */

import { log } from '../../../utils/logger'
import { type WizardState, WizardStep } from '../types'

export function initializeWizardState(): WizardState {
	const initialState: WizardState = {
		active: true,
		currentStep: WizardStep.INITIATE,
		fields: {},
		validation: {
			errors: {},
			warnings: {},
		},
		timestamp: Date.now(),
	}

	log('Initialized new wizard state')
	return initialState
}
