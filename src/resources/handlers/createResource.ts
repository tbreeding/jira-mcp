/**
 * Creates a resource object from a resource definition.
 * This function is used to create a resource object that can be used by the MCP.
 */

import type { ResourceDefinition } from '../types/resource.types'
import type { Resource } from '@modelcontextprotocol/sdk/types.js'

export function createResource(definition: ResourceDefinition): Resource {
	const patternStr = definition.uriPattern.toString()
	const cleanPattern = patternStr.slice(1, patternStr.lastIndexOf('/'))
	const flags = patternStr.slice(patternStr.lastIndexOf('/') + 1)
	const flagsText = flags ? ` (with flags: ${flags})` : ''

	return {
		uri: definition.exampleUri,
		name: `${definition.name} Resource`,
		description: `URI pattern: ${cleanPattern}${flagsText}`,
		mimeType: 'application/json',
		scheme: definition.name,
	}
}
