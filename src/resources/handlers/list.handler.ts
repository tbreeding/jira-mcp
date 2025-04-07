/**
 * MCP Request Handler for the 'resources/list' method.
 * It provides information about available resources that can be accessed by the client.
 * This enables resource discovery in tools like the MCP Inspector.
 */

import { log } from '../../utils/logger'
import { createResource } from './createResource'
import type { ListResourcesRequest, ListResourcesResponse } from './types'
import type { ResourceDefinition, ResourceProvider } from '../types/resource.types'

// Type assertion for accessing the showInResourceList property
interface ResourceDefinitionWithMetadata {
	readonly name: string
	readonly uriPattern: RegExp
	readonly provider: ResourceProvider
	readonly exampleUri: string
	readonly showInResourceList?: boolean
}

/**
 * Creates a handler for resources/list requests that provides information about
 * available resources.
 *
 * @param resourceDefinitions The resource definitions to use
 * @returns A handler function for list resources requests
 */
export function createListResourcesHandler(resourceDefinitions: ReadonlyArray<ResourceDefinition>) {
	return async function handleListResources(_request: ListResourcesRequest): Promise<ListResourcesResponse> {
		log('INFO: Handling resources/list request')

		const filteredDefinitions = resourceDefinitions.filter((def) => {
			const defWithMeta = def as ResourceDefinitionWithMetadata
			return Boolean(defWithMeta.showInResourceList)
		})

		const resources = filteredDefinitions.map(createResource)

		log(`INFO: Returning ${resources.length} resource definitions`)

		return {
			resources,
		}
	}
}
