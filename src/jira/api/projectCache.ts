/**
 * Project cache utility
 *
 * This file implements caching functionality for Jira projects
 * to reduce API calls and improve performance.
 */

import { Failure, Success } from '../../utils/try'
import type Try from '../../utils/try'
import type { JiraProject } from '../types/project.types'

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let projectsCache: {
	data: JiraProject[]
	timestamp: number
} | null = null

/**
 * Checks if the cache is still valid
 * @returns Boolean indicating if cache is valid
 */
export function isCacheValid(): boolean {
	if (!projectsCache) return false

	const now = Date.now()
	const cacheAge = now - projectsCache.timestamp
	return cacheAge < CACHE_TTL_MS
}

/**
 * Updates the projects cache with new data
 * @param projects The projects data to cache
 */
export function updateCache(projects: JiraProject[]): void {
	projectsCache = {
		data: projects,
		timestamp: Date.now(),
	}
}

/**
 * Gets the cached projects
 * @returns A Result containing either the cached projects or an error
 */
export function getFromCache(): Try<JiraProject[]> {
	if (!projectsCache) {
		return Failure(new Error('Cache is not initialized'))
	}
	return Success(projectsCache.data)
}

/**
 * Gets the cached projects directly without Try wrapping
 * Should only be called after checking isCacheValid()
 */
export function getFromCacheUnsafe(): JiraProject[] {
	if (!projectsCache) return []

	return projectsCache.data
}

/**
 * Clears the projects cache
 */
export function clearCache(): void {
	projectsCache = null
}
