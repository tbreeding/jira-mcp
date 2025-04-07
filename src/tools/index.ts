/**
 * Tool Registry and Management Module
 *
 * This module provides centralized registration and access to all available tools in the system.
 * It maintains a registry of tool definitions and their executor functions, handles tool
 * initialization with appropriate configurations, and provides an interface for tool discovery
 * and retrieval.
 */

import { config } from '../config'
import { log } from '../utils/logger'
// Import Issue Creation Wizard tools
import { issueCreationWizardTools, getIssueCreationWizardToolExecutors } from './issueCreationWizard/mcp'
import { analyzeIssueTool, getAnalyzeIssueToolExecutor } from './jira/analyzeIssue'
import { getIssueTool, getIssueToolExecutor } from './jira/getIssue'
import { jiraGetTool, getJiraGetToolExecutor } from './jira/jiraGet/jiraGetTool'
import { getIssuesByJqlTool } from './jira/utils/jqlToolDefinitions'
import { getIssuesByJqlToolExecutor } from './jira/utils/jqlToolExecutor'
import type { JiraApiConfig } from '../jira/api/apiTypes'
import type { ToolExecutor, ToolRegistryEntry } from '../types'
import type { StateManager } from './issueCreationWizard/stateManager'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'

// Registry of all available tools
const toolRegistry = new Map<string, ToolRegistryEntry>()

/**
 * Initialize the tool registry with all available tools
 * @param jiraConfig - Jira API configuration
 * @param stateManager - StateManager instance for issue creation wizard tools
 */
export function initializeToolRegistry(jiraConfig: JiraApiConfig, stateManager: StateManager): void {
	// Register the getJiraIssue tool with validated config
	registerTool(getIssueTool, getIssueToolExecutor(jiraConfig))
	// Register the analyzeJiraIssue tool
	registerTool(analyzeIssueTool, getAnalyzeIssueToolExecutor(jiraConfig))
	// Register the jiraGet tool
	registerTool(jiraGetTool, getJiraGetToolExecutor(jiraConfig))
	// Register the getIssuesByJql tool
	registerTool(getIssuesByJqlTool, getIssuesByJqlToolExecutor(jiraConfig))

	// Register Issue Creation Wizard tools
	const wizardToolExecutors = getIssueCreationWizardToolExecutors(jiraConfig, stateManager)
	registerTool(issueCreationWizardTools.getStateWizardTool, wizardToolExecutors.getStateWizardToolExecutor)
	registerTool(issueCreationWizardTools.getStatusWizardTool, wizardToolExecutors.getStatusWizardToolExecutor)
	registerTool(issueCreationWizardTools.resetStateWizardTool, wizardToolExecutors.resetStateWizardToolExecutor)
	registerTool(issueCreationWizardTools.updateStateWizardTool, wizardToolExecutors.updateStateWizardToolExecutor)
	registerTool(issueCreationWizardTools.createIssueWizardTool, wizardToolExecutors.createIssueWizardToolExecutor)
	registerTool(issueCreationWizardTools.getProjectsWizardTool, wizardToolExecutors.getProjectsWizardToolExecutor)
	registerTool(issueCreationWizardTools.getIssueTypesWizardTool, wizardToolExecutors.getIssueTypesWizardToolExecutor)
	registerTool(issueCreationWizardTools.getFieldsWizardTool, wizardToolExecutors.getFieldsWizardToolExecutor)
	registerTool(issueCreationWizardTools.updateFieldsWizardTool, wizardToolExecutors.updateFieldsWizardToolExecutor)
	registerTool(issueCreationWizardTools.initiateStateWizardTool, wizardToolExecutors.initiateStateWizardToolExecutor)
	registerTool(
		issueCreationWizardTools.setAnalysisCompleteWizardTool,
		wizardToolExecutors.setAnalysisCompleteWizardToolExecutor,
	)
	registerTool(
		issueCreationWizardTools.setUserConfirmationWizardTool,
		wizardToolExecutors.setUserConfirmationWizardToolExecutor,
	)

	log(`INFO: Initialized tool registry with ${toolRegistry.size} tools`)
}

/** Register a tool in the registry */
export function registerTool(tool: Tool, executor: ToolExecutor): boolean {
	if (config.tools.enabledTools.includes(tool.name)) {
		toolRegistry.set(tool.name, { tool, executor })
		log(`DEBUG: Registered tool: ${tool.name}`)
		return true
	} else {
		log(`DEBUG: Tool ${tool.name} is disabled in configuration`)
		return false
	}
}

/** Get all registered tools */
export function getAllTools(): Tool[] {
	return Array.from(toolRegistry.values()).map((entry) => entry.tool)
}

/** Get a tool executor by name */
export function getToolExecutor(name: string): ToolExecutor | null {
	const entry = toolRegistry.get(name)
	return entry ? entry.executor : null
}

/** Check if a tool exists */
export function hasToolByName(name: string): boolean {
	return toolRegistry.has(name)
}
