/**
 * Unit tests for the issue type cache utility
 */

import { isCacheValid, updateCache, getFromCache, getFromCacheUnsafe, clearCache } from '../issueTypeCache'
import type { JiraIssueType } from '../../types/issueType.types'

// Mock Date.now to control timestamp
const mockDateNow = jest.spyOn(Date, 'now')

describe('issueTypeCache', () => {
	const mockIssueTypes: JiraIssueType[] = [
		{
			id: '10000',
			name: 'Bug',
			description: 'A bug in the software',
			iconUrl: 'https://example.com/bug.svg',
			subtask: false,
		},
		{
			id: '10001',
			name: 'Task',
			description: 'A task to be completed',
			iconUrl: 'https://example.com/task.svg',
			subtask: false,
		},
	]

	const mockProjectKey = 'TEST'

	beforeEach(() => {
		// Reset all mocks and clear cache
		jest.clearAllMocks()
		mockDateNow.mockReturnValue(Date.now())
		clearCache()
	})

	test('should initialize with empty cache', () => {
		// Verify cache is empty
		expect(isCacheValid(mockProjectKey)).toBe(false)
		expect(() => getFromCacheUnsafe(mockProjectKey)).not.toThrow()
		expect(getFromCacheUnsafe(mockProjectKey)).toEqual([])

		const result = getFromCache(mockProjectKey)
		expect(result.success).toBe(false)
		expect(result.error?.message).toContain('not initialized')
	})

	test('should update and retrieve from cache', () => {
		// Setup
		const now = Date.now()
		mockDateNow.mockReturnValue(now)

		// Update cache
		updateCache(mockProjectKey, mockIssueTypes)

		// Verify cache state
		expect(isCacheValid(mockProjectKey)).toBe(true)

		// Retrieve safe
		const safeResult = getFromCache(mockProjectKey)
		expect(safeResult.success).toBe(true)
		expect(safeResult.value).toEqual(mockIssueTypes)

		// Retrieve unsafe
		const unsafeResult = getFromCacheUnsafe(mockProjectKey)
		expect(unsafeResult).toEqual(mockIssueTypes)
	})

	test('should invalidate cache after TTL expires', () => {
		// Setup
		const now = Date.now()
		mockDateNow.mockReturnValue(now)

		// Update cache
		updateCache(mockProjectKey, mockIssueTypes)

		// Verify cache is valid
		expect(isCacheValid(mockProjectKey)).toBe(true)

		// Move clock forward beyond TTL (5 minutes + 1 second)
		mockDateNow.mockReturnValue(now + 5 * 60 * 1000 + 1000)

		// Verify cache is now invalid
		expect(isCacheValid(mockProjectKey)).toBe(false)
	})

	test('should clear specific project cache', () => {
		// Setup
		updateCache(mockProjectKey, mockIssueTypes)
		updateCache('DEMO', mockIssueTypes)

		// Verify both caches are valid
		expect(isCacheValid(mockProjectKey)).toBe(true)
		expect(isCacheValid('DEMO')).toBe(true)

		// Clear specific cache
		clearCache(mockProjectKey)

		// Verify only specified cache is cleared
		expect(isCacheValid(mockProjectKey)).toBe(false)
		expect(isCacheValid('DEMO')).toBe(true)
	})

	test('should clear all caches when no project key is provided', () => {
		// Setup
		updateCache(mockProjectKey, mockIssueTypes)
		updateCache('DEMO', mockIssueTypes)

		// Verify both caches are valid
		expect(isCacheValid(mockProjectKey)).toBe(true)
		expect(isCacheValid('DEMO')).toBe(true)

		// Clear all caches
		clearCache()

		// Verify all caches are cleared
		expect(isCacheValid(mockProjectKey)).toBe(false)
		expect(isCacheValid('DEMO')).toBe(false)
	})
})
