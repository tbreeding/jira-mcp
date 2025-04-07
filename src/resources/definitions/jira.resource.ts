/**
 * Defines MCP Resource definitions for Jira entities like issues and searches.
 * Each definition maps a URI pattern to a specific ResourceProvider function.
 * Only default instance patterns are supported.
 */

import { readJiraIssueProvider } from '../providers/jira/readJiraIssueProvider'
import { readJiraSearchProvider } from '../providers/jira/readJiraSearchProvider'
import type { ResourceDefinition } from '../types/resource.types'

// Basic regex, assumes jira:///issue/KEY-123 format for default instance
const JIRA_ISSUE_URI_PATTERN = /^jira:\/\/.*\/issue\/[\w-]+$/i

// Basic regex, assumes jira:///search?jql=... format for default instance
const JIRA_SEARCH_URI_PATTERN = /^jira:\/\/.*\/search\?jql=.+$/i

// Flag to indicate if this definition should be shown in resource listings
interface ResourceDefinitionWithMetadata extends ResourceDefinition {
	readonly showInResourceList?: boolean
}

// Additional examples that show the default instance syntax
const jiraIssueDefaultDefinition: ResourceDefinitionWithMetadata = {
	name: 'jira-issue-default',
	uriPattern: JIRA_ISSUE_URI_PATTERN,
	provider: readJiraIssueProvider,
	exampleUri: 'jira:///issue/PIF-3680',
	showInResourceList: true,
}

const jiraSearchDefaultDefinition: ResourceDefinitionWithMetadata = {
	name: 'jira-search-default',
	uriPattern: JIRA_SEARCH_URI_PATTERN,
	provider: readJiraSearchProvider,
	exampleUri: 'jira:///search?jql=project=PIF',
	showInResourceList: true,
}

export const jiraResourceDefinitions: ReadonlyArray<ResourceDefinition> = [
	jiraIssueDefaultDefinition,
	jiraSearchDefaultDefinition,
]
