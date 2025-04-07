/**
 * Unit tests for the field metadata cache utility
 */

import { isCacheValid, updateCache, getFromCacheUnsafe, clearCache } from '../fieldMetadataCache'
import type { JiraFieldMetadataResponse } from '../../types/fieldMetadata.types'

describe('fieldMetadataCache', () => {
	const mockProjectKey = 'TEST'
	const mockIssueTypeId = '10000'

	// Sample mock data
	const mockFieldMetadata: JiraFieldMetadataResponse = {
		projects: [
			{
				id: '10001',
				key: 'TEST',
				name: 'Test Project',
				issuetypes: [
					{
						id: '10000',
						name: 'Bug',
						subtask: false,
						fields: {
							summary: {
								id: 'summary',
								name: 'Summary',
								required: true,
								schema: { type: 'string', system: 'summary' },
							},
							description: {
								id: 'description',
								name: 'Description',
								required: false,
								schema: { type: 'string', system: 'description' },
							},
						},
					},
				],
			},
		],
	}

	beforeEach(() => {
		// Use fake timers and reset before each test
		jest.useFakeTimers({ doNotFake: [] })
		jest.setSystemTime(new Date())
		clearCache() // Clear the cache to ensure a clean test environment
	})

	afterEach(() => {
		// Restore real timers after each test
		jest.useRealTimers()
	})

	test('should initialize with empty cache', () => {
		// Initially the cache should be empty
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(false)

		// Should not throw when getting from an empty cache
		expect(() => getFromCacheUnsafe(mockProjectKey, mockIssueTypeId)).not.toThrow()

		// Should return empty projects array
		expect(getFromCacheUnsafe(mockProjectKey, mockIssueTypeId)).toEqual({ projects: [] })
	})

	test('should update and retrieve from cache', () => {
		// Setup current time
		const now = new Date()
		jest.setSystemTime(now)

		// Update cache with mock data
		updateCache(mockProjectKey, mockIssueTypeId, mockFieldMetadata)

		// Verify cache is valid
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(true)

		// Retrieve and verify data
		const cachedData = getFromCacheUnsafe(mockProjectKey, mockIssueTypeId)
		expect(cachedData).toEqual(mockFieldMetadata)
	})

	test('should invalidate cache after TTL expires', () => {
		// Setup
		const now = new Date()
		jest.setSystemTime(now)

		// Update cache
		updateCache(mockProjectKey, mockIssueTypeId, mockFieldMetadata)

		// Verify cache is valid initially
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(true)

		// Move clock forward just under 10 minutes
		jest.setSystemTime(new Date(now.getTime() + 10 * 60 * 1000 - 1))

		// Cache should still be valid
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(true)

		// Move clock forward just past 10 minutes
		jest.setSystemTime(new Date(now.getTime() + 10 * 60 * 1000 + 1))

		// Cache should now be invalid
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(false)
	})

	test('should clear specific project and issue type cache', () => {
		// Setup - add two different cache entries
		updateCache(mockProjectKey, mockIssueTypeId, mockFieldMetadata)
		updateCache('DEMO', mockIssueTypeId, mockFieldMetadata)

		// Verify both are valid
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(true)
		expect(isCacheValid('DEMO', mockIssueTypeId)).toBe(true)

		// Clear specific cache
		clearCache(mockProjectKey, mockIssueTypeId)

		// Verify only the specified cache is cleared
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(false)
		expect(isCacheValid('DEMO', mockIssueTypeId)).toBe(true)
	})

	test('should clear all issue types for a project', () => {
		// Setup - add entries with different issue types
		updateCache(mockProjectKey, mockIssueTypeId, mockFieldMetadata)
		updateCache(mockProjectKey, '20000', mockFieldMetadata)
		updateCache('DEMO', mockIssueTypeId, mockFieldMetadata)

		// Verify all are valid
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(true)
		expect(isCacheValid(mockProjectKey, '20000')).toBe(true)
		expect(isCacheValid('DEMO', mockIssueTypeId)).toBe(true)

		// Clear all issue types for a project
		clearCache(mockProjectKey)

		// Verify only entries for the specified project are cleared
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(false)
		expect(isCacheValid(mockProjectKey, '20000')).toBe(false)
		expect(isCacheValid('DEMO', mockIssueTypeId)).toBe(true)
	})

	test('should clear all caches when no parameters provided', () => {
		// Setup - add multiple entries
		updateCache(mockProjectKey, mockIssueTypeId, mockFieldMetadata)
		updateCache('DEMO', '20000', mockFieldMetadata)

		// Verify all are valid
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(true)
		expect(isCacheValid('DEMO', '20000')).toBe(true)

		// Clear all caches
		clearCache()

		// Verify all caches are cleared
		expect(isCacheValid(mockProjectKey, mockIssueTypeId)).toBe(false)
		expect(isCacheValid('DEMO', '20000')).toBe(false)
	})

	test('should handle retrieving non-existent data from cache', () => {
		// Attempt to get data for a key that doesn't exist
		const result = getFromCacheUnsafe('NONEXISTENT', 'NONEXISTENT')

		// Should return empty projects array
		expect(result).toEqual({ projects: [] })
	})
})
