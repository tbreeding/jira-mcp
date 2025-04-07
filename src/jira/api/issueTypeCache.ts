/**
 * Issue Type cache utility
 *
 * This file implements caching functionality for Jira issue types
 * to reduce API calls and improve performance.
 */

import { Failure, Success } from '../../utils/try'
import type Try from '../../utils/try'
import type { JiraIssueType } from '../types/issueType.types'

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Cache structure with project key as the key
const issueTypesCache: Map<
	string,
	{
		data: JiraIssueType[]
		timestamp: number
	}
> = new Map()

/**
 * Checks if the cache is still valid for a specific project
 * @param projectKey The project key to check cache validity for
 * @returns Boolean indicating if cache is valid
 */
export function isCacheValid(projectKey: string): boolean {
	const cache = issueTypesCache.get(projectKey)
	if (!cache) return false

	const now = Date.now()
	const cacheAge = now - cache.timestamp
	return cacheAge < CACHE_TTL_MS
}

/**
 * Updates the issue types cache with new data for a specific project
 * @param projectKey The project key to update cache for
 * @param issueTypes The issue types data to cache
 */
export function updateCache(projectKey: string, issueTypes: JiraIssueType[]): void {
	issueTypesCache.set(projectKey, {
		data: issueTypes,
		timestamp: Date.now(),
	})
}

/**
 * Gets the cached issue types for a specific project
 * @param projectKey The project key to get cached issue types for
 * @returns A Result containing either the cached issue types or an error
 */
export function getFromCache(projectKey: string): Try<JiraIssueType[]> {
	const cache = issueTypesCache.get(projectKey)
	if (!cache) {
		return Failure(new Error(`Cache for project ${projectKey} is not initialized`))
	}
	return Success(cache.data)
}

/**
 * Gets the cached issue types directly without Try wrapping
 * Should only be called after checking isCacheValid()
 * @param projectKey The project key to get cached issue types for
 * @returns The cached issue types or an empty array
 */
export function getFromCacheUnsafe(projectKey: string): JiraIssueType[] {
	const cache = issueTypesCache.get(projectKey)
	if (!cache) return []

	return cache.data
}

/**
 * Clears the issue types cache for a specific project
 * @param projectKey The project key to clear cache for, or undefined to clear all
 */
export function clearCache(projectKey?: string): void {
	if (projectKey) {
		issueTypesCache.delete(projectKey)
	} else {
		issueTypesCache.clear()
	}
}
