/**
 * Server Request Handler Module for the Jira MCP Service
 *
 * This module provides the request handler functions for the server endpoints.
 * It includes handlers for listing available tools and executing tool calls from clients.
 * These handlers validate incoming requests, route them to the appropriate tool executors,
 * and format responses while providing proper error handling and logging throughout
 * the request lifecycle.
 */

/* eslint-disable custom-rules/no-throw-statements */
import { ErrorCode as McpErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'
import { safeExecute } from '../errors/handlers'
import { ErrorCode } from '../errors/types'
import { getAllTools, getToolExecutor, hasToolByName } from '../tools'
import { log } from '../utils/logger'
import { processRequestParameters } from './utils'
import type { ToolCallParams } from '../types'

/**
 * Handle list tools request
 */
export async function handleListTools(): Promise<{ tools: unknown[] }> {
	log('DEBUG: Handling list tools request')

	const result = await safeExecute(() => ({ tools: getAllTools() }), 'Failed to list tools', ErrorCode.SERVER_ERROR)

	if (!result.success) {
		throw new McpError(McpErrorCode.InternalError, result.error.message)
	}

	return result.data
}

/**
 * Handle call tool request
 * @param request - The request object
 */
export async function handleCallTool(request: {
	params: ToolCallParams
}): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
	log(`DEBUG: handleCallTool: ${JSON.stringify(request)}`)
	const { name, parameters } = processRequestParameters(request)

	log(`INFO: Handling call tool request for tool: ${name}`)
	log(`DEBUG: Tool parameters: ${JSON.stringify(parameters)}`)

	// Check if the tool exists
	if (!hasToolByName(name)) {
		log(`ERROR: Tool not found: ${name}`)
		throw new McpError(McpErrorCode.MethodNotFound, `Tool not found: ${name}`)
	}

	// Get the tool executor
	const executor = getToolExecutor(name)
	if (!executor) {
		log(`ERROR: Tool executor not found for: ${name}`)
		throw new McpError(McpErrorCode.InternalError, 'Tool executor not found')
	}

	// Execute the tool
	try {
		log(`DEBUG: Executing tool ${name} with parameters: ${JSON.stringify(parameters)}`)
		// Pass parameters consistently to all executors
		const result = await executor({ arguments: parameters })
		return result
	} catch (error) {
		log(`ERROR: Error executing tool ${name}: ${error}`)
		throw new McpError(McpErrorCode.InternalError, `Error executing tool: ${error}`)
	}
}
