/**
 * Issue Creation Wizard GetProjects Tool Executor
 *
 * This module implements the execution function for the getProjects tool.
 * It retrieves available Jira projects for selection in the wizard.
 */

import { getProjects } from '../../../jira/api/getProjects'
import { createSuccessResult, createErrorResult } from './utils'
import type { JiraApiConfig } from '../../../jira/api/apiTypes'
import type { ToolExecutor } from '../../../types'

/**
 * Get available Jira projects for selection
 */
export function getProjectsWizardToolExecutor(jiraConfig: JiraApiConfig): ToolExecutor {
	return async function (parameters: {
		arguments: Record<string, unknown>
	}): Promise<ReturnType<typeof createSuccessResult>> {
		try {
			// Extract parameters from the arguments object
			const args = parameters.arguments || {}
			const forceRefresh = Boolean(args.forceRefresh)

			// Call the Jira API to retrieve projects
			const result = await getProjects(jiraConfig, forceRefresh)

			if (!result.success) {
				return createErrorResult(`Failed to retrieve projects: ${result.error.message}`)
			}

			// Return the projects in a format suitable for selection
			const projects = result.value.map(function (project) {
				return {
					id: project.id,
					key: project.key,
					name: project.name,
					description: project.description || '',
				}
			})

			return createSuccessResult({
				success: true,
				message: `Retrieved ${projects.length} projects`,
				projects,
			})
		} catch (error) {
			return createErrorResult((error as Error).message)
		}
	}
}
