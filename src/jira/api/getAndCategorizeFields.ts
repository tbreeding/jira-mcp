/**
 * Combined field retrieval and categorization
 *
 * This file implements the combined functionality to retrieve and categorize field metadata.
 */

import { Failure, Success } from '../../utils/try'
import { categorizeFields } from './categorizeFields'
import { findTargetProject } from './findTargetProject'
import { getFieldMetadata } from './getFieldMetadataFunction'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'
import type { CategorizedField } from '../types/fieldMetadata.types'

/**
 * Type for categorized fields grouped by category
 */
export type CategorizedFields = Record<string, CategorizedField[]>

/**
 * Retrieves and categorizes field metadata for issue creation
 */
export async function getAndCategorizeFields(
	projectKey: string,
	projectId: string,
	issueTypeId: string,
	config: JiraApiConfig,
): Promise<Try<CategorizedField[]>> {
	const metadataResult = await getFieldMetadata(projectKey, issueTypeId, config)

	if (metadataResult.error) {
		return Failure(metadataResult.error)
	}

	const response = metadataResult.value

	if (!response.projects || response.projects.length === 0) {
		return Success([])
	}

	const projectResult = findTargetProject(response, projectKey, projectId)

	if (projectResult.error) {
		const error = new Error(`Project ${projectKey} not found`)
		return Failure(error)
	}

	return Success(categorizeFields(projectResult.value))
}
