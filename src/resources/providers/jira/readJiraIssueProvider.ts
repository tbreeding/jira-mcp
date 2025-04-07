/**
 * ResourceProvider for reading individual Jira issues.
 * Parses the URI to extract the issue key and fetches the issue data using fetchJiraIssue.
 * Only supports: jira:///issue/PROJ-123 (uses default Jira instance)
 */

import { createSuccess } from '../../../errors/types' // Import createSuccess from error types
import { getIssueByKey } from '../../../jira/api/getIssue'
import { log } from '../../../utils/logger'
import { parseIssueKeyFromUri } from './issueProvider/parseIssueKeyFromUri'
import type { Result } from '../../../errors/types' // Import Result type
import type { ResourceContent, ResourceProvider, ResourceProviderContext } from '../../types/resource.types'

export const readJiraIssueProvider: ResourceProvider = async (
	uri: string,
	context: ResourceProviderContext,
): Promise<Result<ResourceContent, Error>> => {
	const issueKey = parseIssueKeyFromUri(uri)

	log(`DEBUG: Reading Jira issue for URI: ${uri}, Issue Key: ${issueKey}`)
	if (!issueKey) {
		return { success: false, error: new Error(`Invalid Jira issue URI format: ${uri}`) }
	}

	if (!context.jiraConfig) {
		return {
			success: false,
			error: new Error('Jira API configuration missing in resource provider context.'),
		}
	}

	const { error, value } = await getIssueByKey(issueKey, context.jiraConfig)
	if (error) return { success: false, error }

	return createSuccess({
		content: JSON.stringify(value, null, 2),
		mimeType: 'application/json',
	})
}
