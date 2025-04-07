/**
 * Validates that a step parameter is a valid WizardStep
 */

import { log } from '../../../utils/logger'
import { WizardStep } from '../types'

/**
 * Validates the step parameter
 */
export function validateStep(step: unknown): string | null {
	if (step !== undefined && !Object.values(WizardStep).includes(step as WizardStep)) {
		log(`Invalid step: ${step}`)
		return `Invalid step: ${step}`
	}
	return null
}
