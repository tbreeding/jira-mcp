/**
 * Helper function to find a target project in Jira field metadata
 */

import { Failure, Success } from '../../utils/try'
import type Try from '../../utils/try'
import type { JiraProjectFieldMetadata, JiraFieldMetadataResponse } from '../types/fieldMetadata.types'

/**
 * Finds the target project in the metadata
 */
export function findTargetProject(
	metadata: JiraFieldMetadataResponse,
	projectKey: string,
	projectId: string,
): Try<JiraProjectFieldMetadata> {
	// First try to find by key
	if (projectKey) {
		const targetProject = metadata.projects.find(function (project) {
			return project.key === projectKey
		})
		if (targetProject) {
			return Success(targetProject)
		}
	}

	// Then try to find by ID
	if (projectId) {
		const targetProject = metadata.projects.find(function (project) {
			return project.id === projectId
		})
		if (targetProject) {
			return Success(targetProject)
		}
	}

	return Failure(new Error(`No project found with key "${projectKey}" or ID "${projectId}"`))
}
