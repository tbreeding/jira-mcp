/**
 * Verifies that a state update was successfully applied by checking
 * whether the currentStep field matches the expected value
 */

import { log } from '../../../utils/logger'
import type { WizardState } from '../types'

/**
 * Verifies the state update was applied correctly
 */
export function verifyStateUpdate(step: unknown, updatedState: WizardState): string | null {
	if (step !== undefined && updatedState.currentStep !== step) {
		const message = `expected=${step}, actual=${updatedState.currentStep}`
		log(`State update verification failed: ${message}`)
		return 'State update verification failed: currentStep was not updated correctly'
	}
	return null
}
