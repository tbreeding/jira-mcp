import { createReadResourceHandler } from '../read.handler'
import { findProviderByUri } from '../../findProviderByUri'
import type {
	ResourceDefinition,
	ResourceProvider,
	ResourceContent,
	ResourceProviderContext,
} from '../../types/resource.types'
import type { ReadResourceRequest } from '../types'
import type { Result } from '../../../errors/types'
import { ErrorCode as McpErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'

// Mock dependencies
jest.mock('../../findProviderByUri')
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('createReadResourceHandler', () => {
	// Mock Jira config
	const mockJiraConfig = {
		baseUrl: 'https://jira.example.com',
		username: 'test-user',
		apiToken: 'test-token',
	}

	// Mock resource definitions array
	const mockResourceDefinitions: ResourceDefinition[] = []

	// Mock URI for testing
	const testUri = 'test:resource:123'

	// Reset mocks before each test
	beforeEach(() => {
		jest.resetAllMocks()
	})

	test('successfully returns resource content when provider succeeds', async () => {
		// Mock successful provider
		const mockSuccessProvider: ResourceProvider = async (
			uri: string,
			_context: ResourceProviderContext,
		): Promise<Result<ResourceContent, Error>> => {
			return {
				success: true,
				data: {
					content: `Content for ${uri}`,
					mimeType: 'text/plain',
				},
			}
		}

		// Mock findProviderByUri to return our success provider
		const mockFindProvider = findProviderByUri as jest.MockedFunction<typeof findProviderByUri>
		mockFindProvider.mockReturnValue(mockSuccessProvider)

		// Create handler
		const handler = createReadResourceHandler(mockJiraConfig, mockResourceDefinitions)

		// Create test request
		const request: ReadResourceRequest = {
			method: 'resources/read',
			params: {
				uri: testUri,
			},
		}

		// Call handler
		const result = await handler(request)

		// Verify findProviderByUri was called with correct args
		expect(findProviderByUri).toHaveBeenCalledWith(testUri, mockResourceDefinitions)

		// Verify result structure
		expect(result).toEqual({
			contents: [
				{
					text: `Content for ${testUri}`,
					mimeType: 'text/plain',
					uri: testUri,
				},
			],
		})
	})

	test('throws MethodNotFound error when no provider is found', async () => {
		// Mock findProviderByUri to return undefined (no provider found)
		const mockFindProvider = findProviderByUri as jest.MockedFunction<typeof findProviderByUri>
		mockFindProvider.mockReturnValue(undefined)

		// Create handler
		const handler = createReadResourceHandler(mockJiraConfig, mockResourceDefinitions)

		// Create test request
		const request: ReadResourceRequest = {
			method: 'resources/read',
			params: {
				uri: testUri,
			},
		}

		// Call handler and verify expected error
		await expect(handler(request)).rejects.toThrow(
			new McpError(McpErrorCode.MethodNotFound, `Resource provider not found for URI: ${testUri}`),
		)

		// Verify findProviderByUri was called with correct args
		expect(findProviderByUri).toHaveBeenCalledWith(testUri, mockResourceDefinitions)
	})

	test('throws InternalError when provider returns an error', async () => {
		// Mock error provider
		const mockErrorProvider: ResourceProvider = async (
			_uri: string,
			_context: ResourceProviderContext,
		): Promise<Result<ResourceContent, Error>> => {
			return {
				success: false,
				error: new Error('Provider error'),
			}
		}

		// Mock findProviderByUri to return our error provider
		const mockFindProvider = findProviderByUri as jest.MockedFunction<typeof findProviderByUri>
		mockFindProvider.mockReturnValue(mockErrorProvider)

		// Create handler
		const handler = createReadResourceHandler(mockJiraConfig, mockResourceDefinitions)

		// Create test request
		const request: ReadResourceRequest = {
			method: 'resources/read',
			params: {
				uri: testUri,
			},
		}

		// Call handler and verify expected error
		await expect(handler(request)).rejects.toThrow(
			new McpError(McpErrorCode.InternalError, `Unexpected error reading resource: ${testUri}`),
		)
	})

	test('passes through McpError when provider returns it', async () => {
		// Create an MCP error to be returned by the provider
		const mcpError = new McpError(McpErrorCode.InvalidParams, 'Bad input error')

		// Mock provider that returns an MCP error
		const mockMcpErrorProvider: ResourceProvider = async (
			_uri: string,
			_context: ResourceProviderContext,
		): Promise<Result<ResourceContent, Error>> => {
			return {
				success: false,
				error: mcpError,
			}
		}

		// Mock findProviderByUri to return our MCP error provider
		const mockFindProvider = findProviderByUri as jest.MockedFunction<typeof findProviderByUri>
		mockFindProvider.mockReturnValue(mockMcpErrorProvider)

		// Create handler
		const handler = createReadResourceHandler(mockJiraConfig, mockResourceDefinitions)

		// Create test request
		const request: ReadResourceRequest = {
			method: 'resources/read',
			params: {
				uri: testUri,
			},
		}

		// Call handler and verify that the original MCP error is passed through
		await expect(handler(request)).rejects.toThrow(mcpError)
	})

	test('passes Jira config in the context to the provider', async () => {
		// Create a spy provider to check the context
		let capturedContext: ResourceProviderContext | undefined

		const spyProvider: ResourceProvider = async (
			_uri: string,
			context: ResourceProviderContext,
		): Promise<Result<ResourceContent, Error>> => {
			capturedContext = context
			return {
				success: true,
				data: {
					content: 'test content',
					mimeType: 'text/plain',
				},
			}
		}

		// Mock findProviderByUri to return our spy provider
		const mockFindProvider = findProviderByUri as jest.MockedFunction<typeof findProviderByUri>
		mockFindProvider.mockReturnValue(spyProvider)

		// Create handler
		const handler = createReadResourceHandler(mockJiraConfig, mockResourceDefinitions)

		// Create test request
		const request: ReadResourceRequest = {
			method: 'resources/read',
			params: {
				uri: testUri,
			},
		}

		// Call handler
		await handler(request)

		// Verify the context passed to the provider
		expect(capturedContext).toBeDefined()
		expect(capturedContext?.jiraConfig).toBe(mockJiraConfig)
	})
})
