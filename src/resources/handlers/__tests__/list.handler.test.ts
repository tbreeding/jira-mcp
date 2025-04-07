import { createListResourcesHandler } from '../list.handler'
import type {
	ResourceDefinition,
	ResourceProvider,
	ResourceContent,
	ResourceProviderContext,
} from '../../types/resource.types'
import type { Result } from '../../../errors/types'
import type { ListResourcesRequest } from '../types'

// Mock the logger to prevent actual logging during tests
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('createListResourcesHandler', () => {
	// Mock resource provider function
	const mockProvider: ResourceProvider = async (
		_uri: string,
		_context: ResourceProviderContext,
	): Promise<Result<ResourceContent, Error>> => {
		return {
			success: true,
			data: {
				content: 'test content',
				mimeType: 'text/plain',
			},
		}
	}

	// Create test resource definitions
	const createTestDefinitions = () => {
		const visibleDef1: ResourceDefinition & { showInResourceList: boolean } = {
			name: 'visible-resource-1',
			uriPattern: /^test:visible1:[a-z0-9]+$/,
			provider: mockProvider,
			exampleUri: 'test:visible1:abc123',
			showInResourceList: true,
		}

		const visibleDef2: ResourceDefinition & { showInResourceList: boolean } = {
			name: 'visible-resource-2',
			uriPattern: /^test:visible2:[a-z0-9]+$/i,
			provider: mockProvider,
			exampleUri: 'test:visible2:XYZ789',
			showInResourceList: true,
		}

		const hiddenDef: ResourceDefinition & { showInResourceList: boolean } = {
			name: 'hidden-resource',
			uriPattern: /^test:hidden:[a-z0-9]+$/,
			provider: mockProvider,
			exampleUri: 'test:hidden:123abc',
			showInResourceList: false,
		}

		const unspecifiedDef: ResourceDefinition = {
			name: 'unspecified-resource',
			uriPattern: /^test:unspecified:[a-z0-9]+$/,
			provider: mockProvider,
			exampleUri: 'test:unspecified:def456',
			// No showInResourceList property
		}

		return { visibleDef1, visibleDef2, hiddenDef, unspecifiedDef }
	}

	test('returns only resources with showInResourceList=true', async () => {
		const { visibleDef1, visibleDef2, hiddenDef, unspecifiedDef } = createTestDefinitions()
		const resourceDefinitions = [visibleDef1, visibleDef2, hiddenDef, unspecifiedDef]

		const handler = createListResourcesHandler(resourceDefinitions)
		const result = await handler({} as ListResourcesRequest)

		// Should only return the visible resources
		expect(result.resources).toHaveLength(2)

		// Verify the resources are correctly transformed
		expect(result.resources[0]).toEqual({
			uri: 'test:visible1:abc123',
			name: 'visible-resource-1 Resource',
			description: expect.stringContaining('test:visible1:[a-z0-9]+'),
			mimeType: 'application/json',
			scheme: 'visible-resource-1',
		})

		expect(result.resources[1]).toEqual({
			uri: 'test:visible2:XYZ789',
			name: 'visible-resource-2 Resource',
			description: expect.stringContaining('test:visible2:[a-z0-9]+'),
			mimeType: 'application/json',
			scheme: 'visible-resource-2',
		})
	})

	test('returns empty array when no resources have showInResourceList=true', async () => {
		const { hiddenDef, unspecifiedDef } = createTestDefinitions()
		const resourceDefinitions = [hiddenDef, unspecifiedDef]

		const handler = createListResourcesHandler(resourceDefinitions)
		const result = await handler({} as ListResourcesRequest)

		expect(result.resources).toHaveLength(0)
	})

	test('returns empty array when resource definitions array is empty', async () => {
		const handler = createListResourcesHandler([])
		const result = await handler({} as ListResourcesRequest)

		expect(result.resources).toHaveLength(0)
	})
})
