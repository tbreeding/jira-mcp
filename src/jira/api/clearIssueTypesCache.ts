/**
 * Issue type cache clearing functionality
 *
 * This file implements the functionality to clear the issue types cache.
 */

import { log } from '../../utils/logger'
import { clearCache } from './issueTypeCache'

/**
 * Clears the issue types cache for a specific project or all projects
 * @param projectKey Optional project key to clear cache for
 */
export function clearIssueTypesCache(projectKey?: string): void {
	clearCache(projectKey)
	log(`DEBUG: Issue types cache ${projectKey ? `for project ${projectKey}` : 'for all projects'} cleared`)
}
