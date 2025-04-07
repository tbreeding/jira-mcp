/**
 * Tests for Jira issue type helper functions
 */

import { log } from '../../../utils/logger'
import { Success, Failure } from '../../../utils/try'
import { callJiraApi, RestMethod } from '../callJiraApi'
import { validateProjectKey, getIssueTypesFromProject } from '../issueTypeHelpers'
import type { JiraIssueType } from '../../types/issueType.types'
import type { JiraProjectResponse } from '../../types/project.types'
import type { JiraApiConfig } from '../apiTypes'

// Mock dependencies
jest.mock('../callJiraApi')
jest.mock('../../../utils/logger')

describe('validateProjectKey', () => {
	it('should return Success when project key is provided', () => {
		// Arrange
		const projectKey = 'TEST'

		// Act
		const result = validateProjectKey(projectKey)

		// Assert
		expect(result.success).toBe(true)
		expect(result.value).toBeUndefined()
	})

	it('should return Failure when project key is empty', () => {
		// Arrange
		const projectKey = ''

		// Act
		const result = validateProjectKey(projectKey)

		// Assert
		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
		if (result.error) {
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error.message).toBe('Project key is required to retrieve issue types')
		}
		expect(log).toHaveBeenCalledWith('ERROR: Missing project key for issue types retrieval')
	})

	it('should return Failure when project key is undefined', () => {
		// Arrange
		const projectKey = undefined as unknown as string

		// Act
		const result = validateProjectKey(projectKey)

		// Assert
		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
		if (result.error) {
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error.message).toBe('Project key is required to retrieve issue types')
		}
		expect(log).toHaveBeenCalledWith('ERROR: Missing project key for issue types retrieval')
	})
})

describe('getIssueTypesFromProject', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return issue types when API call is successful', async () => {
		// Arrange
		const projectId = 'TEST'
		const config: JiraApiConfig = {
			baseUrl: 'https://test.atlassian.net',
			username: 'test@example.com',
			apiToken: 'test-token',
		}

		const mockIssueTypes: JiraIssueType[] = [
			{ id: '1', name: 'Bug', description: 'Bug description', iconUrl: 'bug-icon.png', subtask: false },
			{ id: '2', name: 'Task', description: 'Task description', iconUrl: 'task-icon.png', subtask: false },
		]

		const mockResponse: JiraProjectResponse = {
			id: projectId,
			key: 'TEST',
			name: 'Test Project',
			issueTypes: mockIssueTypes,
		}

		const mockApiResponse = Success(mockResponse)

		// Mock the API call
		const mockedCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>
		mockedCallJiraApi.mockResolvedValue(mockApiResponse)

		// Act
		const result = await getIssueTypesFromProject(projectId, config)

		// Assert
		expect(result.success).toBe(true)
		expect(result.value).toEqual(mockIssueTypes)
		expect(callJiraApi).toHaveBeenCalledWith({
			config,
			endpoint: `/rest/api/3/project/${projectId}?expand=issuetypes`,
			method: RestMethod.GET,
		})
		expect(log).toHaveBeenCalledWith(
			`DEBUG: Falling back to project endpoint: /rest/api/3/project/${projectId}?expand=issuetypes`,
		)
		expect(log).toHaveBeenCalledWith(`DEBUG: Retrieved ${mockIssueTypes.length} issue types from project endpoint`)
	})

	it('should return Failure when API call fails', async () => {
		// Arrange
		const projectId = 'TEST'
		const config: JiraApiConfig = {
			baseUrl: 'https://test.atlassian.net',
			username: 'test@example.com',
			apiToken: 'test-token',
		}

		const mockError = new Error('API call failed')
		const mockApiResponse = Failure(mockError)

		// Mock the API call
		const mockedCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>
		mockedCallJiraApi.mockResolvedValue(mockApiResponse)

		// Act
		const result = await getIssueTypesFromProject(projectId, config)

		// Assert
		expect(result.success).toBe(false)
		expect(result.error).toBe(mockError)
		expect(callJiraApi).toHaveBeenCalledWith({
			config,
			endpoint: `/rest/api/3/project/${projectId}?expand=issuetypes`,
			method: RestMethod.GET,
		})
		expect(log).toHaveBeenCalledWith(
			`DEBUG: Falling back to project endpoint: /rest/api/3/project/${projectId}?expand=issuetypes`,
		)
		expect(log).toHaveBeenCalledWith(`ERROR: Failed to retrieve issue types from project: ${mockError.message}`)
	})

	it('should handle empty issue types array in response', async () => {
		// Arrange
		const projectId = 'TEST'
		const config: JiraApiConfig = {
			baseUrl: 'https://test.atlassian.net',
			username: 'test@example.com',
			apiToken: 'test-token',
		}

		const mockResponse: JiraProjectResponse = {
			id: projectId,
			key: 'TEST',
			name: 'Test Project',
			issueTypes: [],
		}

		const mockApiResponse = Success(mockResponse)

		// Mock the API call
		const mockedCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>
		mockedCallJiraApi.mockResolvedValue(mockApiResponse)

		// Act
		const result = await getIssueTypesFromProject(projectId, config)

		// Assert
		expect(result.success).toBe(true)
		expect(result.value).toEqual([])
		expect(log).toHaveBeenCalledWith('DEBUG: Retrieved 0 issue types from project endpoint')
	})

	it('should handle missing issue types in response', async () => {
		// Arrange
		const projectId = 'TEST'
		const config: JiraApiConfig = {
			baseUrl: 'https://test.atlassian.net',
			username: 'test@example.com',
			apiToken: 'test-token',
		}

		const mockResponse: JiraProjectResponse = {
			id: projectId,
			key: 'TEST',
			name: 'Test Project',
			// issueTypes is missing
		}

		const mockApiResponse = Success(mockResponse)

		// Mock the API call
		const mockedCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>
		mockedCallJiraApi.mockResolvedValue(mockApiResponse)

		// Act
		const result = await getIssueTypesFromProject(projectId, config)

		// Assert
		expect(result.success).toBe(true)
		expect(result.value).toEqual([])
		expect(log).toHaveBeenCalledWith('DEBUG: Retrieved 0 issue types from project endpoint')
	})
})
