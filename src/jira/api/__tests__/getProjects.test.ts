import { Success, Failure } from '../../../utils/try'
import { callJiraApi } from '../callJiraApi'
import { getProjects, getProjectByKey, clearProjectsCache } from '../getProjects'
import { isCacheValid, updateCache, getFromCacheUnsafe, clearCache } from '../projectCache'
import type { JiraProject, JiraProjectsResponse } from '../../types/project.types'
import type { JiraApiConfig } from '../apiTypes'

jest.mock('../callJiraApi')
jest.mock('../projectCache')
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

const mockCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>
const mockIsCacheValid = isCacheValid as jest.MockedFunction<typeof isCacheValid>
const mockUpdateCache = updateCache as jest.MockedFunction<typeof updateCache>
const mockGetFromCacheUnsafe = getFromCacheUnsafe as jest.MockedFunction<typeof getFromCacheUnsafe>
const mockClearCache = clearCache as jest.MockedFunction<typeof clearCache>

describe('getProjects', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'testuser',
		apiToken: 'test-token',
	}

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

	const mockResponse: JiraProjectsResponse = mockProjects

	beforeEach(() => {
		jest.clearAllMocks()
		mockCallJiraApi.mockResolvedValue(Success(mockResponse))
		mockIsCacheValid.mockReturnValue(false)
		mockGetFromCacheUnsafe.mockReturnValue(mockProjects)
	})

	test('should fetch projects from API when cache is invalid', async () => {
		// Execute
		const result = await getProjects(mockConfig)

		// Verify
		expect(mockIsCacheValid).toHaveBeenCalled()
		expect(mockCallJiraApi).toHaveBeenCalledWith({
			config: mockConfig,
			endpoint: '/rest/api/3/project',
			method: 'GET',
		})
		expect(mockUpdateCache).toHaveBeenCalledWith(mockProjects)
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockProjects)
	})

	test('should return cached projects when cache is valid', async () => {
		// Setup
		mockIsCacheValid.mockReturnValue(true)

		// Execute
		const result = await getProjects(mockConfig)

		// Verify
		expect(mockIsCacheValid).toHaveBeenCalled()
		expect(mockCallJiraApi).not.toHaveBeenCalled()
		expect(mockGetFromCacheUnsafe).toHaveBeenCalled()
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockProjects)
	})

	test('should force refresh from API when forceRefresh is true', async () => {
		// Setup
		mockIsCacheValid.mockReturnValue(true)

		// Execute
		const result = await getProjects(mockConfig, true)

		// Verify
		expect(mockCallJiraApi).toHaveBeenCalled()
		expect(mockUpdateCache).toHaveBeenCalledWith(mockProjects)
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockProjects)
	})

	test('should handle API error', async () => {
		// Setup
		const mockError = new Error('API error')
		mockCallJiraApi.mockResolvedValue(Failure(mockError))

		// Execute
		const result = await getProjects(mockConfig)

		// Verify
		expect(result.success).toBe(false)
		expect(result.error).toEqual(mockError)
	})
})

describe('getProjectByKey', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'testuser',
		apiToken: 'test-token',
	}

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
		jest.clearAllMocks()
		mockCallJiraApi.mockResolvedValue(Success(mockProjects))
		mockIsCacheValid.mockReturnValue(false)
	})

	test('should return a project by key', async () => {
		// Execute
		const result = await getProjectByKey('TEST', mockConfig)

		// Verify
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockProjects[0])
	})

	test('should return an error when project is not found', async () => {
		// Execute
		const result = await getProjectByKey('NONEXISTENT', mockConfig)

		// Verify
		expect(result.success).toBe(false)
		expect(result.error?.message).toEqual('Project with key NONEXISTENT not found')
	})

	test('should handle API error', async () => {
		// Setup
		const mockError = new Error('API error')
		mockCallJiraApi.mockResolvedValue(Failure(mockError))

		// Execute
		const result = await getProjectByKey('TEST', mockConfig)

		// Verify
		expect(result.success).toBe(false)
		expect(result.error).toEqual(mockError)
	})
})

describe('clearProjectsCache', () => {
	test('should clear the cache', () => {
		// Execute
		clearProjectsCache()

		// Verify
		expect(mockClearCache).toHaveBeenCalled()
	})
})
