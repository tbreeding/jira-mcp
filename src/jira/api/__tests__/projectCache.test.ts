import { isCacheValid, updateCache, getFromCache, getFromCacheUnsafe, clearCache } from '../projectCache'
import type { JiraProject } from '../../types/project.types'

describe('projectCache', () => {
	const mockProjects: JiraProject[] = [
		{
			id: '10000',
			key: 'TEST',
			name: 'Test Project',
			projectTypeKey: 'software',
			simplified: false,
			style: 'classic',
			isPrivate: false,
		},
		{
			id: '10001',
			key: 'DEMO',
			name: 'Demo Project',
			projectTypeKey: 'business',
			simplified: true,
			style: 'next-gen',
			isPrivate: false,
		},
	]

	beforeEach(() => {
		// Clear the cache before each test
		clearCache()
	})

	test('isCacheValid should return false when cache is empty', () => {
		expect(isCacheValid()).toBe(false)
	})

	test('isCacheValid should return true when cache is populated', () => {
		// Setup
		updateCache(mockProjects)

		// Verify
		expect(isCacheValid()).toBe(true)
	})

	test('updateCache should store projects in cache', () => {
		// Execute
		updateCache(mockProjects)

		// Verify
		const result = getFromCache()
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockProjects)
	})

	test('getFromCache should return failure when cache is empty', () => {
		// Execute
		const result = getFromCache()

		// Verify
		expect(result.success).toBe(false)
		expect(result.error?.message).toEqual('Cache is not initialized')
	})

	test('getFromCacheUnsafe should return cached projects', () => {
		// Setup
		updateCache(mockProjects)

		// Execute & Verify
		expect(getFromCacheUnsafe()).toEqual(mockProjects)
	})

	test('getFromCacheUnsafe should return empty array when cache is empty', () => {
		// Execute with empty cache
		const result = getFromCacheUnsafe()

		// Verify
		expect(result).toEqual([])
		expect(Array.isArray(result)).toBe(true)
		expect(result.length).toBe(0)
	})

	test('clearCache should empty the cache', () => {
		// Setup
		updateCache(mockProjects)
		expect(isCacheValid()).toBe(true)

		// Execute
		clearCache()

		// Verify
		expect(isCacheValid()).toBe(false)
	})
})
