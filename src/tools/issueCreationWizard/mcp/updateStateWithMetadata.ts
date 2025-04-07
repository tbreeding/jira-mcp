/**
 * Provides a function to update the Issue Creation Wizard's state
 * by adding fetched field metadata to the 'analysis' section.
 * It handles state refreshing and returns the complete updated state.
 */
import { log } from '../../../utils/logger'
import { createProcessErrorResult } from './utils'
import type { StateManager } from '../stateManager'
import type { WizardState } from '../types'
import type { ProcessResult } from './utils'
import type { CategorizedFields } from '../../../jira/api/getAndCategorizeFields'

export async function updateStateWithMetadata(
	stateManager: StateManager,
	currentState: WizardState,
	metadata: CategorizedFields,
): Promise<ProcessResult> {
	try {
		log('DEBUG: Updating wizard state with fetched field metadata.')
		const currentAnalysis = currentState.analysis ?? {}
		await stateManager.updateState({
			analysis: {
				...currentAnalysis,
				metadata: metadata,
			},
		})

		const updatedStateResult = await stateManager.getState()
		if (!updatedStateResult.success || !updatedStateResult.data) {
			log('ERROR: Failed to refresh state after metadata update.')
			return createProcessErrorResult('Failed to refresh state after metadata update.')
		}

		log('DEBUG: Wizard state updated successfully with metadata and refreshed.')
		return {
			success: true,
			message: 'State updated successfully with metadata.',
			data: updatedStateResult.data as WizardState,
		}
	} catch (updateError) {
		const error =
			updateError instanceof Error ? updateError : new Error('Unknown error during state update with metadata')
		log(`ERROR: Failed to update wizard state with metadata: ${error.message}`, error)
		return createProcessErrorResult(`Failed to update wizard state with metadata: ${error.message}`)
	}
}
