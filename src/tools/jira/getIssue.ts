/**
 * Jira Issue Retrieval Tool Integration
 *
 * This module provides the integrated entry point for the Jira issue retrieval tool.
 * It combines the tool definition and executor components from the utils subfolder
 * and provides a simplified facade for other modules to consume. This approach
 * maintains a clean separation of concerns while providing a unified API.
 */

import { getIssueTool as baseIssueTool } from './utils/toolDefinitions'
import { getIssueToolExecutor as createIssueToolExecutor } from './utils/toolExecutor'
import type { JiraApiConfig } from '../../jira/api/apiTypes'
import type { ToolExecutor } from '../../types'

/**
 * The Jira issue retrieval tool definition with enhanced documentation
 */
export const getIssueTool = {
	...baseIssueTool,
	// Additional metadata can be added here if needed in the future
}

/**
 * Creates a configured executor for the Jira issue retrieval tool
 * Adds enhanced error handling and validation
 */
export function getIssueToolExecutor(jiraConfig: JiraApiConfig): ToolExecutor {
	return createIssueToolExecutor(jiraConfig)
}
