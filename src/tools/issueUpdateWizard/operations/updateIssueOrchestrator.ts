/**
 * Update Issue Orchestrator
 *
 * This module orchestrates the entire issue update process, combining multiple operations
 * into a unified workflow. It handles the core logic for updating any Jira issue, whether
 * it was just created or is an existing issue.
 */

import { log } from '../../../utils/logger'
import { Success, Failure } from '../../../utils/try'
import { updateIssue } from './updateIssue'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type Try from '../../../utils/try'
import type { StateManager } from '../../issueCreationWizard/stateManager'

export async function updateIssueFromState(stateManager: StateManager, config: JiraApiConfig): Promise<Try<string>> {
	const stateResult = stateManager.getState()

	if (!stateResult.success) {
		return Failure(new Error(stateResult.error.message))
	}

	const state = stateResult.data

	if (!state.issueKey) {
		return Failure(new Error('Cannot update issue: No issue key in state'))
	}

	log(`[DEBUG] Updating issue ${state.issueKey} from state`)

	try {
		const { error, value: updateResult } = await updateIssue(state, config)

		if (error) {
			return Failure(error)
		}

		return Success(updateResult)
	} catch (err) {
		return Failure(err as Error)
	}
}
