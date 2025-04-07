/**
 * Defines the core types and interfaces used by the MCP Resource framework.
 * This includes definitions for resource content, providers, and the structure
 * that links resource URI patterns to their corresponding providers.
 */

import type { Result } from '../../errors/types'
import type { JiraApiConfig } from '../../jira/api/apiTypes' // Import config type

export interface ResourceContent {
	readonly content: string
	readonly mimeType: string
}

// Context object potentially containing configuration, auth, etc.
export interface ResourceProviderContext {
	jiraConfig?: JiraApiConfig // Making it optional for flexibility if other providers don't need it
}

export type ResourceProvider = (
	uri: string,
	context: ResourceProviderContext, // Added context parameter
) => Promise<Result<ResourceContent, Error>>

export interface ResourceDefinition {
	readonly name: string // e.g., 'jira-issue', 'jira-jql-search'
	readonly uriPattern: RegExp // Regex to match resource URIs
	readonly provider: ResourceProvider // Function to read the resource
	readonly exampleUri: string // Example URI that matches the pattern
	// Optional: Function for metadata (TBD)
	// readonly getMetadata?: (uri: string) => Promise<{ displayName?: string; mimeType: string; ... }>;
}
