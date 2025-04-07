/**
 * Unit tests for getProjectsExecutor
 */

import * as getProjectsAPI from '../../../../jira/api/getProjects'
import { Failure, Success } from '../../../../utils/try'
import { getProjectsWizardToolExecutor } from '../getProjectsExecutor'
import type { JiraApiConfig } from '../../../../jira/api/apiTypes'
import type { JiraProject } from '../../../../jira/types/project.types'

// Mock the getProjects API function
jest.mock('../../../../jira/api/getProjects')

describe('getProjectsWizardToolExecutor', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://test-jira.example.com',
		username: 'test-user',
		apiToken: 'fake-token',
	}

	const mockProjects: JiraProject[] = [
		{
			id: '10001',
			key: 'TEST',
			name: 'Test Project',
			description: 'A project for testing',
			projectTypeKey: 'software',
			simplified: false,
			style: 'classic',
			isPrivate: false,
		},
		{
			id: '10002',
			key: 'DEV',
			name: 'Development Project',
			projectTypeKey: 'software',
			simplified: false,
			style: 'classic',
			isPrivate: false,
		},
	]

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return projects when API call succeeds', async () => {
		// Setup mock
		const getProjectsMock = jest.spyOn(getProjectsAPI, 'getProjects')
		getProjectsMock.mockResolvedValue(Success(mockProjects))

		// Create the executor
		const executor = getProjectsWizardToolExecutor(mockConfig)

		// Call the executor
		const result = await executor({ arguments: {} })

		// Extract the JSON data from the result
		const content = result.content[0]
		if (content.type === 'text') {
			const jsonData = JSON.parse(content.text)
			expect(jsonData.success).toBe(true)
			expect(jsonData.projects).toHaveLength(2)
			expect(jsonData.projects[0].key).toBe('TEST')
			expect(jsonData.projects[1].key).toBe('DEV')
			expect(jsonData.message).toContain('Retrieved 2 projects')
		}

		// Verify the API was called with the right parameters
		expect(getProjectsMock).toHaveBeenCalledWith(mockConfig, false)
	})

	it('should respect forceRefresh parameter', async () => {
		// Setup mock
		const getProjectsMock = jest.spyOn(getProjectsAPI, 'getProjects')
		getProjectsMock.mockResolvedValue(Success(mockProjects))

		// Create the executor
		const executor = getProjectsWizardToolExecutor(mockConfig)

		// Call the executor with forceRefresh=true
		await executor({ arguments: { forceRefresh: true } })

		// Verify the API was called with forceRefresh=true
		expect(getProjectsMock).toHaveBeenCalledWith(mockConfig, true)
	})

	it('should return error when API call fails', async () => {
		// Setup mock to return an error
		const mockError = new Error('API error')
		const getProjectsMock = jest.spyOn(getProjectsAPI, 'getProjects')
		getProjectsMock.mockResolvedValue(Failure(mockError))

		// Create the executor
		const executor = getProjectsWizardToolExecutor(mockConfig)

		// Call the executor
		const result = await executor({ arguments: {} })

		// Verify result contains error
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Failed to retrieve projects')
	})

	it('should handle exceptions', async () => {
		// Setup mock to throw an exception
		const getProjectsMock = jest.spyOn(getProjectsAPI, 'getProjects')
		getProjectsMock.mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Create the executor
		const executor = getProjectsWizardToolExecutor(mockConfig)

		// Call the executor
		const result = await executor({ arguments: {} })

		// Verify result contains error
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Unexpected error')
	})

	it('should handle missing arguments parameter', async () => {
		// Setup mock
		const getProjectsMock = jest.spyOn(getProjectsAPI, 'getProjects')
		getProjectsMock.mockResolvedValue(Success(mockProjects))

		// Create the executor
		const executor = getProjectsWizardToolExecutor(mockConfig)

		// Call the executor with a type assertion to simulate missing arguments
		const result = await executor({} as any)

		// Extract the JSON data from the result
		const content = result.content[0]
		if (content.type === 'text') {
			const jsonData = JSON.parse(content.text)
			expect(jsonData.success).toBe(true)
			expect(jsonData.projects).toHaveLength(2)
			expect(jsonData.message).toContain('Retrieved 2 projects')
		}

		// Verify the API was called with default forceRefresh=false
		expect(getProjectsMock).toHaveBeenCalledWith(mockConfig, false)
	})
})
