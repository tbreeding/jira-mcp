/**
 * Update Issue Operation
 *
 * Handles the core update operation for Jira issues.
 * This operation adapts the current state into a proper Jira API update request.
 */

import { callJiraApi, RestMethod } from '../../../jira/api/callJiraApi'
import { transformFieldsForPayload } from '../../../jira/api/utils/transformFieldsForPayload'
import { log } from '../../../utils/logger'
import { Success, Failure } from '../../../utils/try'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { CreateIssueFields } from '../../../jira/api/createIssue'
import type Try from '../../../utils/try'
import type { WizardState } from '../../issueCreationWizard/types'

interface UpdateResponse {
	id: string
	key: string
	self: string
}

/**
 * Updates an issue in Jira based on the wizard state
 */
export async function updateIssue(state: WizardState, config: JiraApiConfig): Promise<Try<string>> {
	if (!state.issueKey) {
		return Failure(new Error('Cannot update issue: No issue key provided'))
	}

	try {
		log(`[DEBUG] Updating issue ${state.issueKey}`)

		// Transform fields using the shared utility
		const fieldsToUpdate: Partial<CreateIssueFields> = transformFieldsForPayload(
			state.fields as Partial<CreateIssueFields>,
			log,
		)

		if (Object.keys(fieldsToUpdate).length === 0) {
			return Failure(new Error('No fields to update'))
		}

		const payload = {
			fields: fieldsToUpdate,
		}

		log(`[DEBUG] Update payload: ${JSON.stringify(payload)}`)

		const response = await callJiraApi<typeof payload, UpdateResponse>({
			config,
			endpoint: `/rest/api/3/issue/${state.issueKey}`,
			method: RestMethod.PUT,
			body: payload,
		})

		if (!response.success) {
			return Failure(response.error)
		}

		return Success(state.issueKey)
	} catch (err) {
		return Failure(err instanceof Error ? err : new Error(String(err)))
	}
}
