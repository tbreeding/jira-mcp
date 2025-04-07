/**
 *
 * Validates that a project key exists in Jira
 *
 */

import { getProjectByKey } from '../../../jira/api/getProjects'
import { log } from '../../../utils/logger'
import { WizardStep } from '../types'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'

/**
 * Validates project key when step is PROJECT_SELECTION
 */
export async function validateProjectKey(
	projectKey: string,
	step: unknown,
	jiraConfig?: JiraApiConfig,
): Promise<string | null> {
	if (projectKey && jiraConfig && step === WizardStep.PROJECT_SELECTION) {
		log(`Validating project key: ${projectKey}`)
		const projectResult = await getProjectByKey(projectKey, jiraConfig)
		if (!projectResult.success) {
			log(`Invalid project key: ${projectKey}. ${projectResult.error.message}`)
			return `Invalid project key: ${projectKey}. ${projectResult.error.message}`
		}
		log(`Project validation successful: ${projectKey}`)
	}
	return null
}
