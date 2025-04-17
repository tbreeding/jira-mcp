/**
 *
 * This utility provides a pure function to check if the wizard state contains cached field metadata.
 * It is used to avoid redundant API calls in the Jira Issue Creation Wizard by preferring existing state data
 * when available and valid. This function is designed for testability and clean separation of concerns.
 */

import type { ErrorResult } from '../../../errors/types'
import type { WizardState } from '../types'

/**
 * Checks if the wizard state contains cached field metadata
 */
export function hasCachedFieldMetadata(wizardStateResult: { success: true; data: WizardState } | ErrorResult): boolean {
	if (!wizardStateResult.success) return false

	const wizardState = wizardStateResult.data
	return Boolean(
		wizardState.analysis &&
			wizardState.analysis.metadata &&
			Array.isArray(wizardState.analysis.metadata.required) &&
			wizardState.analysis.metadata.required.length > 0,
	)
}
