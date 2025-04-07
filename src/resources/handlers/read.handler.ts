/**
 * MCP Request Handler for the 'resources/read' method.
 * It receives a URI, finds the corresponding provider using the registry,
 * executes the provider, and returns the resource content or an error.
 */

/* eslint-disable custom-rules/no-throw-statements */
import { ErrorCode as McpErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'
import { log } from '../../utils/logger'
import { findProviderByUri } from '../findProviderByUri'
import type { ReadResourceRequest, ReadResourceResponse } from './types'
import type { JiraApiConfig } from '../../jira/api/apiTypes'
import type { ResourceDefinition, ResourceProviderContext } from '../types/resource.types'

export function createReadResourceHandler(
	jiraConfig: JiraApiConfig,
	resourceDefinitions: ReadonlyArray<ResourceDefinition>,
) {
	return async function handleReadResource(request: ReadResourceRequest): Promise<ReadResourceResponse> {
		const { uri } = request.params
		log(`INFO: Handling resources/read request for URI: ${uri}`)

		const provider = findProviderByUri(uri, resourceDefinitions)

		if (!provider) {
			log(`WARN: No resource provider found for URI: ${uri}`)
			throw new McpError(McpErrorCode.MethodNotFound, `Resource provider not found for URI: ${uri}`)
		}

		const context: ResourceProviderContext = { jiraConfig: jiraConfig }

		const result = await provider(uri, context)

		if (!result.success) throw constructError(uri, result.error)

		const { content, ...restData } = result.data
		return { contents: [{ text: content, ...restData, uri }] }
	}
}

function constructError(uri: string, error: Error): McpError {
	log(`ERROR: Resource provider failed for URI: ${uri} - Error: ${(error as Error).message}`)
	if (error instanceof McpError) return error

	return new McpError(McpErrorCode.InternalError, `Unexpected error reading resource: ${uri}`)
}
