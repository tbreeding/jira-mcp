/**
 * Field Metadata cache utility
 *
 * This file implements caching functionality for Jira field metadata
 * to reduce API calls and improve performance.
 */

import type { JiraFieldMetadataResponse } from '../types/fieldMetadata.types'

// Cache configuration
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

// Cache structure with projectKey_issueTypeId as the key
const fieldMetadataCache: Map<
	string,
	{
		data: JiraFieldMetadataResponse
		timestamp: number
	}
> = new Map()

/**
 * Generates a cache key from project key and issue type ID
 */
function getCacheKey(projectKey: string, issueTypeId: string): string {
	return `${projectKey}_${issueTypeId}`
}

/**
 * Checks if the cache is still valid for a specific project and issue type
 */
export function isCacheValid(projectKey: string, issueTypeId: string): boolean {
	const cacheKey = getCacheKey(projectKey, issueTypeId)
	const cache = fieldMetadataCache.get(cacheKey)
	if (!cache) return false

	const now = Date.now()
	const cacheAge = now - cache.timestamp
	return cacheAge < CACHE_TTL_MS
}

/**
 * Updates the field metadata cache with new data
 */
export function updateCache(projectKey: string, issueTypeId: string, metadata: JiraFieldMetadataResponse): void {
	const cacheKey = getCacheKey(projectKey, issueTypeId)
	fieldMetadataCache.set(cacheKey, {
		data: metadata,
		timestamp: Date.now(),
	})
}

/**
 * Gets the cached field metadata directly without Try wrapping
 * Should only be called after checking isCacheValid()
 */
export function getFromCacheUnsafe(projectKey: string, issueTypeId: string): JiraFieldMetadataResponse {
	const cacheKey = getCacheKey(projectKey, issueTypeId)
	const cache = fieldMetadataCache.get(cacheKey)
	if (!cache) return { projects: [] }

	return cache.data
}

/**
 * Clears the field metadata cache
 */
export function clearCache(projectKey?: string, issueTypeId?: string): void {
	if (projectKey && issueTypeId) {
		// Clear specific project and issue type
		const cacheKey = getCacheKey(projectKey, issueTypeId)
		fieldMetadataCache.delete(cacheKey)
	} else if (projectKey) {
		// Clear all issue types for a project
		const prefix = `${projectKey}_`
		for (const key of fieldMetadataCache.keys()) {
			if (key.startsWith(prefix)) {
				fieldMetadataCache.delete(key)
			}
		}
	} else {
		// Clear all
		fieldMetadataCache.clear()
	}
}
