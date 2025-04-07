/**
 * Prepares the Jira issue payload from the wizard state.
 *
 * Assumes that the input state has already been validated
 * to ensure required fields (projectKey, issueTypeId, summary) are present.
 */
import { log } from '../../../utils/logger'
import type { CreateIssueFields } from '../../../jira/api/createIssue'
import type { WizardState } from '../types'

/**
 * Prepares the payload for the createIssue API call.
 */
export function prepareIssuePayload(state: WizardState): CreateIssueFields {
	log(`Preparing issue creation payload from raw state fields`)
	const issueData: CreateIssueFields = {
		summary: state.fields.summary as string,
		project: { key: state.projectKey as string },
		issuetype: { name: 'Task' }, // Use name instead of ID for compatibility with Jira API v3
		...state.fields,
	}
	log(`DEBUG: Raw issue creation payload for createIssue: ${JSON.stringify(issueData)}`)
	return issueData
}
