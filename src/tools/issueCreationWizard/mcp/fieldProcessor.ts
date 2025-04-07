/**
 * Field Processor
 *
 * Handles field processing and validation for the Jira Issue Creation Wizard.
 */

import { getAndCategorizeFields } from '../../../jira/api/getAndCategorizeFields'
import { getProjectByKey } from '../../../jira/api/getProjects'
import { log } from '../../../utils/logger'
import { convertToCategorizedFields, createValidationResponse, updateWizardWithFields } from './fieldProcessorUtils'
import { validateFieldsWithMetadata } from './fieldValidationService'
import { updateStateWithMetadata } from './updateStateWithMetadata'
import { createProcessErrorResult } from './utils'
import type { WizardState } from '../types'
import type { ProcessResult } from './utils'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { StateManager } from '../stateManager'

interface WizardStateInfo {
	state: WizardState
	projectKey: string
	issueTypeId: string
}

interface FieldsParams {
	fields: Record<string, unknown>
	validateOnly?: boolean
}

export async function processFieldsAndState(
	stateManager: StateManager,
	jiraConfig: JiraApiConfig,
	checkResult: WizardStateInfo,
	params: FieldsParams,
): Promise<ProcessResult> {
	const { state: initialState, projectKey, issueTypeId } = checkResult

	try {
		log(`CUSTOM: processFieldsAndState - ${JSON.stringify({ params })}`)
		const projectResult = await getProjectByKey(projectKey, jiraConfig)
		log(`CUSTOM: processFieldsAndState - ${JSON.stringify({ projectResult })}`)
		if (!projectResult.success) {
			return createProcessErrorResult(`Failed to retrieve project information: ${projectResult.error.message}`)
		}
		const projectId = projectResult.value.id

		const fieldsResult = await getAndCategorizeFields(projectKey, projectId, issueTypeId, jiraConfig)
		if (!fieldsResult.success) {
			return createProcessErrorResult(`Failed to retrieve field metadata: ${fieldsResult.error.message}`)
		}
		const fetchedMetadataArray = fieldsResult.value // Store metadata array

		const categorizedMetadataObject = convertToCategorizedFields(fetchedMetadataArray)
		const metadataUpdateResult = await updateStateWithMetadata(stateManager, initialState, categorizedMetadataObject)

		if (!metadataUpdateResult.success) return metadataUpdateResult

		const refreshedState = metadataUpdateResult.data as WizardState
		const validationResult = validateFieldsWithMetadata(params.fields, categorizedMetadataObject)

		if (params.validateOnly) return createValidationResponse(validationResult)

		if (!validationResult.isValid) {
			log('ERROR: Field validation failed.')
			return createProcessErrorResult('Validation failed for one or more fields')
		}

		return updateWizardWithFields(stateManager, refreshedState as unknown as Record<string, unknown>, params.fields)
	} catch (error) {
		// Refine error handling for non-Error objects
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
		log(`ERROR: Error processing fields: ${errorMessage}`, error instanceof Error ? error : undefined)
		return createProcessErrorResult(`Error processing fields: ${errorMessage}`)
	}
}
