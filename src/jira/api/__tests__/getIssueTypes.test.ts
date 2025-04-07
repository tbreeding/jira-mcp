/**
 * Unit tests for the Jira issue types retrieval functionality
 */

import { Failure, Success } from '../../../utils/try'
import { callJiraApi } from '../callJiraApi'
import { clearIssueTypesCache } from '../clearIssueTypesCache'
import { getIssueTypeById } from '../getIssueTypeById'
import { getIssueTypes } from '../getIssueTypesFunction'
import { clearCache, isCacheValid, updateCache, getFromCacheUnsafe } from '../issueTypeCache'
import type { JiraIssueType, JiraIssueTypesResponse } from '../../types/issueType.types'
import type { JiraApiConfig } from '../apiTypes'

jest.mock('../callJiraApi')
jest.mock('../issueTypeCache')
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

const mockCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>
const mockIsCacheValid = isCacheValid as jest.MockedFunction<typeof isCacheValid>
const mockUpdateCache = updateCache as jest.MockedFunction<typeof updateCache>
const mockGetFromCacheUnsafe = getFromCacheUnsafe as jest.MockedFunction<typeof getFromCacheUnsafe>
const mockClearCache = clearCache as jest.MockedFunction<typeof clearCache>

describe('getIssueTypes', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'testuser',
		apiToken: 'test-token',
	}

	const mockProjectKey = 'TEST'

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

	const mockResponse: JiraIssueTypesResponse = {
		issueTypes: mockIssueTypes,
	}

	beforeEach(() => {
		jest.clearAllMocks()
		mockCallJiraApi.mockResolvedValue(Success(mockResponse))
		mockIsCacheValid.mockReturnValue(false)
		mockGetFromCacheUnsafe.mockReturnValue(mockIssueTypes)
	})

	test('should return an error when project key is missing', async () => {
		// Execute with empty project key
		const result = await getIssueTypes('', mockConfig)

		// Verify
		expect(result.success).toBe(false)
		expect(result.error?.message).toContain('Project key is required')
		expect(mockCallJiraApi).not.toHaveBeenCalled()
	})

	test('should fetch issue types from API when cache is invalid', async () => {
		// Execute
		const result = await getIssueTypes(mockProjectKey, mockConfig)

		// Verify
		expect(mockIsCacheValid).toHaveBeenCalledWith(mockProjectKey)
		expect(mockCallJiraApi).toHaveBeenCalledWith({
			config: mockConfig,
			endpoint: `/rest/api/3/project/${mockProjectKey}?expand=issuetypes`,
			method: 'GET',
		})
		expect(mockUpdateCache).toHaveBeenCalledWith(mockProjectKey, mockIssueTypes)
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockIssueTypes)
	})

	test('should return cached issue types when cache is valid', async () => {
		// Setup
		mockIsCacheValid.mockReturnValue(true)

		// Execute
		const result = await getIssueTypes(mockProjectKey, mockConfig)

		// Verify
		expect(mockIsCacheValid).toHaveBeenCalledWith(mockProjectKey)
		expect(mockCallJiraApi).not.toHaveBeenCalled()
		expect(mockGetFromCacheUnsafe).toHaveBeenCalledWith(mockProjectKey)
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockIssueTypes)
	})

	test('should force refresh from API when forceRefresh is true', async () => {
		// Setup
		mockIsCacheValid.mockReturnValue(true)

		// Execute
		const result = await getIssueTypes(mockProjectKey, mockConfig, true)

		// Verify
		expect(mockCallJiraApi).toHaveBeenCalled()
		expect(mockUpdateCache).toHaveBeenCalledWith(mockProjectKey, mockIssueTypes)
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockIssueTypes)
	})

	test('should handle API error', async () => {
		// Setup
		const mockError = new Error('API error')
		mockCallJiraApi.mockResolvedValue(Failure(mockError))

		// Execute
		const result = await getIssueTypes(mockProjectKey, mockConfig)

		// Verify
		expect(result.success).toBe(false)
		expect(result.error).toEqual(mockError)
	})

	test('should handle empty response', async () => {
		// Setup
		mockCallJiraApi.mockResolvedValue(Success({ issueTypes: [] }))

		// Execute
		const result = await getIssueTypes(mockProjectKey, mockConfig)

		// Verify
		expect(result.success).toBe(true)
		expect(result.value).toEqual([])
	})
})

describe('getIssueTypeById', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'testuser',
		apiToken: 'test-token',
	}

	const mockProjectKey = 'TEST'

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

	const mockResponse: JiraIssueTypesResponse = {
		issueTypes: mockIssueTypes,
	}

	beforeEach(() => {
		jest.clearAllMocks()
		mockCallJiraApi.mockResolvedValue(Success(mockResponse))
		mockIsCacheValid.mockReturnValue(false)
	})

	test('should return an issue type by ID', async () => {
		// Execute
		const result = await getIssueTypeById(mockProjectKey, '10000', mockConfig)

		// Verify
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockIssueTypes[0])
	})

	test('should return an error when issue type is not found', async () => {
		// Execute
		const result = await getIssueTypeById(mockProjectKey, 'nonexistent', mockConfig)

		// Verify
		expect(result.success).toBe(false)
		expect(result.error?.message).toEqual(`Issue type with ID nonexistent not found for project ${mockProjectKey}`)
	})

	test('should handle API error', async () => {
		// Setup
		const mockError = new Error('API error')
		mockCallJiraApi.mockResolvedValue(Failure(mockError))

		// Execute
		const result = await getIssueTypeById(mockProjectKey, '10000', mockConfig)

		// Verify
		expect(result.success).toBe(false)
		expect(result.error).toEqual(mockError)
	})
})

describe('clearIssueTypesCache', () => {
	test('should clear the cache for specific project', () => {
		// Execute
		clearIssueTypesCache('TEST')

		// Verify
		expect(mockClearCache).toHaveBeenCalledWith('TEST')
	})

	test('should clear all caches', () => {
		// Execute
		clearIssueTypesCache()

		// Verify
		expect(mockClearCache).toHaveBeenCalledWith(undefined)
	})
})
