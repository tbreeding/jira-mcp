/**
 * Resource Registry
 *
 * This module manages the collection of Resource Definitions and provides
 * a mechanism to locate the appropriate Resource Provider based on a given URI.
 * It imports definitions from various sources (like Jira) and consolidates them.
 */

import type { ResourceDefinition, ResourceProvider } from './types/resource.types'

export function findProviderByUri(
	uri: string,
	resourceDefinitions: ReadonlyArray<ResourceDefinition>,
): ResourceProvider | undefined {
	const definition = resourceDefinitions.find((def) => def.uriPattern.test(uri))
	return definition?.provider
}
