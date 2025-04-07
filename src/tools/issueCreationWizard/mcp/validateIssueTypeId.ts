/**
 * Validates that an issue type ID exists for a specific project in Jira
 */

import { getIssueTypeById } from '../../../jira/api/getIssueTypeById'
import { WizardStep } from '../types'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { WizardState } from '../types'

/**
 * Validates issue type ID when step is ISSUE_TYPE_SELECTION
 */
export async function validateIssueTypeId(
	issueTypeId: string,
	step: unknown,
	projectKey: string | undefined,
	currentState: WizardState,
	jiraConfig?: JiraApiConfig,
): Promise<string | null> {
	if (issueTypeId && jiraConfig && step === WizardStep.ISSUE_TYPE_SELECTION) {
		const projectKeyToUse = (projectKey || currentState.projectKey) as string
		if (!projectKeyToUse) {
			return 'Cannot validate issue type: No project key available'
		}

		const issueTypeResult = await getIssueTypeById(projectKeyToUse, issueTypeId, jiraConfig)
		if (!issueTypeResult.success) {
			return `Invalid issue type ID: ${issueTypeId}. ${issueTypeResult.error.message}`
		}
	}
	return null
}
