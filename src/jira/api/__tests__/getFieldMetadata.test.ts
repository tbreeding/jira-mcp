/**
 * Tests for the field metadata retrieval functionality
 */

import { Failure, Success } from '../../../utils/try'
import { FieldCategory } from '../../types/fieldMetadata.types'
import { callJiraApi } from '../callJiraApi'
import { categorizeFields } from '../categorizeFields'
import { clearCache } from '../fieldMetadataCache'
import { findTargetProject } from '../findTargetProject'
import { getAndCategorizeFields } from '../getAndCategorizeFields'
import { getFieldMetadata } from '../getFieldMetadataFunction'
import type { JiraFieldMetadataResponse, JiraProjectFieldMetadata } from '../../types/fieldMetadata.types'
import type { JiraApiConfig } from '../apiTypes'

// Mock dependencies
jest.mock('../callJiraApi')
jest.mock('../findTargetProject')
const mockedCallJiraApi = callJiraApi as jest.MockedFunction<typeof callJiraApi>
const mockedFindTargetProject = findTargetProject as jest.MockedFunction<typeof findTargetProject>

describe('Field Metadata Retrieval', () => {
	const mockConfig: JiraApiConfig = {
		baseUrl: 'https://example.atlassian.net',
		username: 'test-user',
		apiToken: 'test-token',
	}

	const mockProjectKey = 'TEST'
	const mockIssueTypeId = '10001'

	// Sample field metadata response
	const mockFieldMetadataResponse: JiraFieldMetadataResponse = {
		projects: [
			{
				id: '10000',
				key: 'TEST',
				name: 'Test Project',
				issuetypes: [
					{
						id: '10001',
						name: 'Story',
						subtask: false,
						fields: {
							summary: {
								id: 'summary',
								name: 'Summary',
								required: true,
								schema: {
									type: 'string',
									system: 'summary',
								},
							},
							description: {
								id: 'description',
								name: 'Description',
								required: false,
								schema: {
									type: 'doc',
									system: 'description',
								},
							},
							customfield_10001: {
								id: 'customfield_10001',
								name: 'Story Points',
								required: false,
								custom: true,
								schema: {
									type: 'number',
									custom: 'com.atlassian.jira.plugin.system.customfieldtypes:float',
								},
							},
						},
					},
				],
			},
		],
	}

	beforeEach(() => {
		jest.clearAllMocks()
		clearCache()
	})

	describe('getFieldMetadata', () => {
		it('should retrieve field metadata successfully', async () => {
			// Setup mock response
			mockedCallJiraApi.mockResolvedValueOnce(Success(mockFieldMetadataResponse))

			// Call the function
			const result = await getFieldMetadata(mockProjectKey, mockIssueTypeId, mockConfig)

			// Assert results
			expect(result.error).toBeUndefined()
			expect(result.value).toEqual(mockFieldMetadataResponse)
			expect(mockedCallJiraApi).toHaveBeenCalledWith({
				config: mockConfig,
				endpoint: `/rest/api/3/issue/createmeta?projectKeys=${mockProjectKey}&issuetypeIds=${mockIssueTypeId}&expand=projects.issuetypes.fields`,
				method: 'GET',
			})
		})

		it('should return error when project key is missing', async () => {
			// Call with empty project key
			const result = await getFieldMetadata('', mockIssueTypeId, mockConfig)

			// Assert results
			expect(result.error).not.toBeNull()
			expect(result.error?.message).toContain('Project key is required')
			expect(mockedCallJiraApi).not.toHaveBeenCalled()
		})

		it('should return error when issue type ID is missing', async () => {
			// Call with empty issue type ID
			const result = await getFieldMetadata(mockProjectKey, '', mockConfig)

			// Assert results
			expect(result.error).not.toBeNull()
			expect(result.error?.message).toContain('Issue type ID is required')
			expect(mockedCallJiraApi).not.toHaveBeenCalled()
		})

		it('should return cached data when available', async () => {
			// First call to populate cache
			mockedCallJiraApi.mockResolvedValueOnce(Success(mockFieldMetadataResponse))

			await getFieldMetadata(mockProjectKey, mockIssueTypeId, mockConfig)

			// Reset mock to verify it's not called again
			mockedCallJiraApi.mockClear()

			// Second call should use cache
			const result = await getFieldMetadata(mockProjectKey, mockIssueTypeId, mockConfig)

			// Assert results
			expect(result.error).toBeUndefined()
			expect(result.value).toEqual(mockFieldMetadataResponse)
			expect(mockedCallJiraApi).not.toHaveBeenCalled()
		})

		it('should force refresh when requested', async () => {
			// First call to populate cache
			mockedCallJiraApi.mockResolvedValueOnce(Success(mockFieldMetadataResponse))

			await getFieldMetadata(mockProjectKey, mockIssueTypeId, mockConfig, true)

			// Reset mock for second call
			mockedCallJiraApi.mockClear()
			mockedCallJiraApi.mockResolvedValueOnce(Success(mockFieldMetadataResponse))

			// Second call with force refresh
			const result = await getFieldMetadata(mockProjectKey, mockIssueTypeId, mockConfig, true)

			// Assert results
			expect(result.error).toBeUndefined()
			expect(result.value).toEqual(mockFieldMetadataResponse)
			expect(mockedCallJiraApi).toHaveBeenCalledTimes(1)
		})

		it('should handle API errors', async () => {
			// Setup mock error response
			const mockError = new Error('API error')
			mockedCallJiraApi.mockResolvedValueOnce(Failure(mockError))

			// Call the function
			const result = await getFieldMetadata(mockProjectKey, mockIssueTypeId, mockConfig)

			// Assert results
			expect(result.error).toBe(mockError)
			expect(result.value).toBeUndefined()
		})
	})

	describe('categorizeFields', () => {
		it('should categorize fields correctly', () => {
			// Create a sample project metadata
			const projectMetadata: JiraProjectFieldMetadata = mockFieldMetadataResponse.projects[0]

			// Call the function
			const result = categorizeFields(projectMetadata)

			// Assert results
			expect(result).toHaveLength(3)

			// Check summary field is categorized as required
			const summaryField = result.find((field) => field.id === 'summary')
			expect(summaryField).toBeDefined()
			expect(summaryField?.category).toBe(FieldCategory.REQUIRED)

			// Check description field is categorized as system
			const descField = result.find((field) => field.id === 'description')
			expect(descField).toBeDefined()
			expect(descField?.category).toBe(FieldCategory.SYSTEM)

			// Check custom field is categorized as custom
			const customField = result.find((field) => field.id === 'customfield_10001')
			expect(customField).toBeDefined()
			expect(customField?.category).toBe(FieldCategory.CUSTOM)
		})

		it('should return empty array for empty issuetypes', () => {
			// Create a project metadata with no issue types
			const emptyProjectMetadata: JiraProjectFieldMetadata = {
				id: '10000',
				key: 'TEST',
				name: 'Test Project',
				issuetypes: [],
			}

			// Call the function
			const result = categorizeFields(emptyProjectMetadata)

			// Assert results
			expect(result).toEqual([])
		})
	})

	describe('getAndCategorizeFields', () => {
		it('should retrieve and categorize fields successfully', async () => {
			// Setup mock responses
			mockedCallJiraApi.mockResolvedValueOnce(Success(mockFieldMetadataResponse))
			mockedFindTargetProject.mockReturnValueOnce(Success(mockFieldMetadataResponse.projects[0]))

			// Call the function
			const result = await getAndCategorizeFields(mockProjectKey, '10000', mockIssueTypeId, mockConfig)

			// Assert results
			expect(result.error).toBeUndefined()
			expect(result.value).toHaveLength(3)

			// Verify the first field is correctly categorized
			expect(result.value?.[0]).toHaveProperty('id')
			expect(result.value?.[0]).toHaveProperty('name')
			expect(result.value?.[0]).toHaveProperty('metadata')
			expect(result.value?.[0]).toHaveProperty('category')
		})

		it('should handle API errors', async () => {
			// Setup mock error response
			const mockError = new Error('API error')
			mockedCallJiraApi.mockResolvedValueOnce(Failure(mockError))

			// Call the function
			const result = await getAndCategorizeFields(mockProjectKey, '10000', mockIssueTypeId, mockConfig)

			// Assert results
			expect(result.error).toBe(mockError)
			expect(result.value).toBeUndefined()
		})

		it('should handle empty projects in response', async () => {
			// Setup mock response with empty projects
			mockedCallJiraApi.mockResolvedValueOnce(Success({ projects: [] }))

			// Call the function
			const result = await getAndCategorizeFields(mockProjectKey, '10000', mockIssueTypeId, mockConfig)

			// Assert results
			expect(result.error).toBeUndefined()
			expect(result.value).toEqual([])
		})

		it('should handle project not found in response', async () => {
			// Setup mock responses
			const differentProjectResponse = {
				projects: [
					{
						id: '10000',
						key: 'DIFFERENT',
						name: 'Different Project',
						issuetypes: [],
					},
				],
			}

			mockedCallJiraApi.mockResolvedValueOnce(Success(differentProjectResponse))
			mockedFindTargetProject.mockReturnValueOnce(Failure(new Error('Project not found')))

			// Call the function
			const result = await getAndCategorizeFields(mockProjectKey, '10000', mockIssueTypeId, mockConfig)

			// Assert results
			expect(result.error).toBeDefined()
			expect(result.error?.message).toBe(`Project ${mockProjectKey} not found`)
			expect(result.value).toBeUndefined()
		})
	})
})
