/**
 * Jira project retrieval functionality
 *
 * This file implements the API calls required to fetch projects from Jira.
 * It includes caching mechanism to prevent excessive API calls and
 * transformation logic to normalize the response data.
 */

import { log } from '../../utils/logger'
import { Failure, Success } from '../../utils/try'
import { callJiraApi, RestMethod } from './callJiraApi'
import { isCacheValid, updateCache, getFromCacheUnsafe, clearCache } from './projectCache'
import type { JiraApiConfig } from './apiTypes'
import type Try from '../../utils/try'
import type { JiraProject, JiraProjectsResponse } from '../types/project.types'

/**
 * Clears the projects cache
 */
export function clearProjectsCache(): void {
	clearCache()
	log('DEBUG: Projects cache cleared')
}

/**
 * Retrieves all accessible Jira projects
 * @param config Jira API configuration
 * @param forceRefresh Whether to bypass cache and force a fresh API call
 * @returns A Result object containing either the projects or an error
 */
export async function getProjects(config: JiraApiConfig, forceRefresh = false): Promise<Try<JiraProject[]>> {
	// Return cached data if available and not forcing refresh
	if (!forceRefresh && isCacheValid()) {
		log('DEBUG: Returning projects from cache')
		return Success(getFromCacheUnsafe())
	}

	// Call Jira API to get projects
	const { error, value: response } = await callJiraApi<Record<string, never>, JiraProjectsResponse>({
		config,
		endpoint: '/rest/api/3/project',
		method: RestMethod.GET,
	})

	// If the API call failed, return the error
	if (error) {
		log('ERROR: Failed to retrieve projects', error)
		return Failure(error)
	}

	// Handle the mock or empty response case for testing purposes
	const projects = response as JiraProject[]

	// Update cache with the new data
	updateCache(projects)

	log(`DEBUG: Retrieved ${projects.length} projects from API`)
	return Success(projects)
}

/**
 * Retrieves a specific Jira project by key
 * @param projectKey The key of the project to retrieve
 * @param config Jira API configuration
 * @returns A Result object containing either the project or an error
 */
export async function getProjectByKey(projectKey: string, config: JiraApiConfig): Promise<Try<JiraProject>> {
	// First get all projects (using cache if available)
	const { error, value: projects } = await getProjects(config)

	// If the API call failed, return the error
	if (error) {
		return Failure(error)
	}

	// Find the project by key
	const project = projects.find((p) => p.key === projectKey)

	if (!project) {
		return Failure(new Error(`Project with key ${projectKey} not found`))
	}

	return Success(project)
}
