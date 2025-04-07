/**
 * Core Type Definitions
 *
 * This module defines the core type interfaces used throughout the application.
 * It includes standardized types for tool results, executor functions, registry entries,
 * and request parameters. These shared type definitions ensure consistency across
 * different components and provide a common vocabulary for data structures passing
 * between various parts of the system.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

/**
 * Standard tool result format
 */
export interface ToolResult {
	content: Array<{ type: string; text: string }>
	isError?: boolean
}

/**
 * Function signature for tool execution
 *
 * All parameters are passed in a flattened structure within the arguments object.
 * Tool implementations should access parameters directly from parameters.arguments.
 */
export type ToolExecutor = (parameters: { arguments: Record<string, unknown> }) => Promise<ToolResult>

/**
 * Tool registry entry to track available tools
 */
export interface ToolRegistryEntry {
	tool: Tool
	executor: ToolExecutor
}

/**
 * Request parameters for tool execution
 */
export interface ToolCallParams {
	name: string
	parameters?: Record<string, unknown>
	arguments?: Record<string, unknown>
}
