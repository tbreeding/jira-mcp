import { createResource } from '../createResource'
import type {
	ResourceDefinition,
	ResourceProvider,
	ResourceContent,
	ResourceProviderContext,
} from '../../types/resource.types'
import type { Result } from '../../../errors/types'

describe('createResource', () => {
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

	test('creates a resource object from a definition with no regex flags', () => {
		// Create a definition with a regex without flags
		const definition: ResourceDefinition = {
			name: 'test-resource',
			uriPattern: /^test:resource:[a-z0-9]+$/,
			provider: mockProvider,
			exampleUri: 'test:resource:abc123',
		}

		const resource = createResource(definition)

		expect(resource).toEqual({
			uri: 'test:resource:abc123',
			name: 'test-resource Resource',
			description: 'URI pattern: ^test:resource:[a-z0-9]+$',
			mimeType: 'application/json',
			scheme: 'test-resource',
		})
	})

	test('creates a resource object from a definition with regex flags', () => {
		// Create a definition with a regex with flags
		const definition: ResourceDefinition = {
			name: 'test-resource-flags',
			uriPattern: /^test:resource:[a-z0-9]+$/i,
			provider: mockProvider,
			exampleUri: 'test:resource:XYZ789',
		}

		const resource = createResource(definition)

		expect(resource).toEqual({
			uri: 'test:resource:XYZ789',
			name: 'test-resource-flags Resource',
			description: 'URI pattern: ^test:resource:[a-z0-9]+$ (with flags: i)',
			mimeType: 'application/json',
			scheme: 'test-resource-flags',
		})
	})

	test('creates a resource object from a definition with multiple regex flags', () => {
		// Create a definition with a regex with multiple flags
		const definition: ResourceDefinition = {
			name: 'multi-flag-resource',
			uriPattern: /^multi:flag:[a-z0-9]+$/gi,
			provider: mockProvider,
			exampleUri: 'multi:flag:test123',
		}

		const resource = createResource(definition)

		expect(resource).toEqual({
			uri: 'multi:flag:test123',
			name: 'multi-flag-resource Resource',
			description: 'URI pattern: ^multi:flag:[a-z0-9]+$ (with flags: gi)',
			mimeType: 'application/json',
			scheme: 'multi-flag-resource',
		})
	})

	test('creates a resource object from a complex regex pattern', () => {
		// Create a definition with a more complex regex
		const definition: ResourceDefinition = {
			name: 'complex-resource',
			uriPattern: /^complex:resource:([a-zA-Z]+)-(\d+)-(.+)$/,
			provider: mockProvider,
			exampleUri: 'complex:resource:TEST-123-details',
		}

		const resource = createResource(definition)

		expect(resource).toEqual({
			uri: 'complex:resource:TEST-123-details',
			name: 'complex-resource Resource',
			description: 'URI pattern: ^complex:resource:([a-zA-Z]+)-(\\d+)-(.+)$',
			mimeType: 'application/json',
			scheme: 'complex-resource',
		})
	})
})
