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
import { issueCreationWizardTools, getIssueCreationWizardToolExecutors } from './issueCreationWizard/mcp'
import { getIssueUpdateWizardToolExecutors } from './issueUpdateWizard/mcp/getIssueUpdateWizardToolExecutors'
import { loadIssueIntoStateTool } from './issueUpdateWizard/mcp/toolDefinitions/loadIssueIntoStateTool'
import { updateIssueFromStateTool } from './issueUpdateWizard/mcp/toolDefinitions/updateIssueFromStateTool'
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
 */
export function initializeToolRegistry(jiraConfig: JiraApiConfig, stateManager: StateManager): void {
	// Core Jira tools
	registerTool(getIssueTool, getIssueToolExecutor(jiraConfig))
	registerTool(analyzeIssueTool, getAnalyzeIssueToolExecutor(jiraConfig))
	registerTool(jiraGetTool, getJiraGetToolExecutor(jiraConfig))
	registerTool(getIssuesByJqlTool, getIssuesByJqlToolExecutor(jiraConfig))

	// Issue Creation Wizard tools
	const wizardExecs = getIssueCreationWizardToolExecutors(jiraConfig, stateManager)
	const wizardTools = issueCreationWizardTools
	// Register all creation wizard tools
	registerToolPair(wizardTools.getStateWizardTool, wizardExecs.getStateWizardToolExecutor)
	registerToolPair(wizardTools.getStatusWizardTool, wizardExecs.getStatusWizardToolExecutor)
	registerToolPair(wizardTools.resetStateWizardTool, wizardExecs.resetStateWizardToolExecutor)
	registerToolPair(wizardTools.updateStateWizardTool, wizardExecs.updateStateWizardToolExecutor)
	registerToolPair(wizardTools.createIssueWizardTool, wizardExecs.createIssueWizardToolExecutor)
	registerToolPair(wizardTools.getProjectsWizardTool, wizardExecs.getProjectsWizardToolExecutor)
	registerToolPair(wizardTools.getIssueTypesWizardTool, wizardExecs.getIssueTypesWizardToolExecutor)
	registerToolPair(wizardTools.getFieldsWizardTool, wizardExecs.getFieldsWizardToolExecutor)
	registerToolPair(wizardTools.updateFieldsWizardTool, wizardExecs.updateFieldsWizardToolExecutor)
	registerToolPair(wizardTools.initiateStateWizardTool, wizardExecs.initiateStateWizardToolExecutor)
	registerToolPair(wizardTools.setAnalysisCompleteWizardTool, wizardExecs.setAnalysisCompleteWizardToolExecutor)
	registerToolPair(wizardTools.setUserConfirmationWizardTool, wizardExecs.setUserConfirmationWizardToolExecutor)

	// Issue Update Wizard tools
	const updateExecs = getIssueUpdateWizardToolExecutors(jiraConfig, stateManager)
	registerToolPair(updateIssueFromStateTool, updateExecs.updateIssueFromStateToolExecutor)
	registerToolPair(loadIssueIntoStateTool, updateExecs.loadIssueIntoStateToolExecutor)

	log(`INFO: Initialized tool registry with ${toolRegistry.size} tools`)
}

/** Helper to register a tool and executor pair */
function registerToolPair(tool: Tool, executor: ToolExecutor): void {
	registerTool(tool, executor)
}

/** Register a tool in the registry */
export function registerTool(tool: Tool, executor: ToolExecutor): boolean {
	if (config.tools.enabledTools.includes(tool.name)) {
		toolRegistry.set(tool.name, { tool, executor })
		log(`DEBUG: Registered tool: ${tool.name}`)
		return true
	}
	log(`DEBUG: Tool ${tool.name} is disabled in configuration`)
	return false
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
