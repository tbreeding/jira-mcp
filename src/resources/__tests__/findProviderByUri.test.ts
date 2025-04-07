import { findProviderByUri } from '../findProviderByUri'
import type {
	ResourceDefinition,
	ResourceProvider,
	ResourceProviderContext,
	ResourceContent,
} from '../types/resource.types'
import type { Result } from '../../errors/types'

describe('findProviderByUri', () => {
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

	// Mock resource definitions
	const mockResourceDefinitions: ReadonlyArray<ResourceDefinition> = [
		{
			name: 'jira-issue',
			uriPattern: /^jira:issue:[A-Z]+-\d+$/,
			provider: mockProvider,
			exampleUri: 'jira:issue:ABC-123',
		},
		{
			name: 'github-repo',
			uriPattern: /^github:repo:[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/,
			provider: mockProvider,
			exampleUri: 'github:repo:user/repo',
		},
	]

	test('returns the correct provider for a matching Jira issue URI', () => {
		const uri = 'jira:issue:ABC-123'
		const result = findProviderByUri(uri, mockResourceDefinitions)

		expect(result).toBe(mockProvider)
	})

	test('returns the correct provider for a matching GitHub repo URI', () => {
		const uri = 'github:repo:user/repo'
		const result = findProviderByUri(uri, mockResourceDefinitions)

		expect(result).toBe(mockProvider)
	})

	test('returns undefined when no matching provider is found', () => {
		const uri = 'unknown:resource:xyz'
		const result = findProviderByUri(uri, mockResourceDefinitions)

		expect(result).toBeUndefined()
	})

	test('returns undefined with an empty resource definitions array', () => {
		const uri = 'jira:issue:ABC-123'
		const result = findProviderByUri(uri, [])

		expect(result).toBeUndefined()
	})

	test('matches based on regex pattern, not exact string comparison', () => {
		const uri = 'jira:issue:XYZ-789' // Different from example but matches pattern
		const result = findProviderByUri(uri, mockResourceDefinitions)

		expect(result).toBe(mockProvider)
	})

	test('returns the first matching provider when multiple patterns match', () => {
		// Create definitions with overlapping patterns
		const overlappingProvider: ResourceProvider = async (
			_uri: string,
			_context: ResourceProviderContext,
		): Promise<Result<ResourceContent, Error>> => {
			return {
				success: true,
				data: {
					content: 'overlapping content',
					mimeType: 'text/plain',
				},
			}
		}

		const overlappingDefinitions: ReadonlyArray<ResourceDefinition> = [
			{
				name: 'specific-jira',
				uriPattern: /^jira:issue:ABC-\d+$/,
				provider: overlappingProvider,
				exampleUri: 'jira:issue:ABC-123',
			},
			...mockResourceDefinitions,
		]

		const uri = 'jira:issue:ABC-456'
		const result = findProviderByUri(uri, overlappingDefinitions)

		expect(result).toBe(overlappingProvider)
	})
})
