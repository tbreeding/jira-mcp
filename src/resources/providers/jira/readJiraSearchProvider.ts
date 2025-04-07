/**
 * ResourceProvider for reading Jira search results based on a JQL query.
 * Parses the URI to extract the JQL query and fetches the results using searchJiraIssues.
 * Only supports: jira:///search?jql=... (uses default Jira instance)
 */

import { searchIssuesByJql } from '../../../jira/api/searchIssuesByJql'
import { log } from '../../../utils/logger'
import { parseJqlFromUri } from './searchProvider/parseJqlFromUri'
import type { Result } from '../../../errors/types'
import type { ResourceContent, ResourceProvider, ResourceProviderContext } from '../../types/resource.types'

export const readJiraSearchProvider: ResourceProvider = async (
	uri: string,
	context: ResourceProviderContext,
): Promise<Result<ResourceContent, Error>> => {
	const jql = parseJqlFromUri(uri)
	log(`DEBUG: Reading Jira search results for URI: ${uri}, Extracted JQL: ${jql}`)

	if (!jql) {
		return { success: false, error: new Error(`Invalid or incomplete Jira search URI: ${uri}`) }
	}

	if (!context.jiraConfig) {
		return {
			success: false,
			error: new Error('Jira API configuration missing in resource provider context.'),
		}
	}

	const { error, value } = await searchIssuesByJql(jql, context.jiraConfig)
	if (error) return { success: false, error }

	return {
		success: true,
		data: {
			content: JSON.stringify(value, null, 2),
			mimeType: 'application/json',
		},
	}
}
