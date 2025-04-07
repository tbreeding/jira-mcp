/**
 * Server Initialization Module for Jira MCP Integration
 *
 * This module handles the setup and initialization of the Model Context Protocol (MCP) server
 * that powers the Jira integration. It configures the server with appropriate request handlers,
 * establishes the stdio transport layer for communication, and manages server lifecycle events.
 * The server provides an interface for Jira-related tools to be discovered and executed by client
 * applications through a standardized protocol.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ListPromptsRequestSchema,
	GetPromptRequestSchema,
	ReadResourceRequestSchema,
	ListResourcesRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { config } from '../config'
import { log } from '../utils/logger'
import type { handleCallTool, handleListTools } from './handlers'
import type { handleGetPrompt } from '../prompts/handlers/get.handler'
import type { handleListPrompts } from '../prompts/handlers/list.handler'
import type {
	ListResourcesRequest,
	ListResourcesResult,
	ReadResourceRequest,
	ReadResourceResult,
} from '@modelcontextprotocol/sdk/types.js'

// Define the expected handler signatures for clarity and type safety
// TODO: Extract this interface to src/server/types.ts to reduce file length
interface ServerHandlers {
	listTools: typeof handleListTools
	callTool: typeof handleCallTool
	listPrompts: typeof handleListPrompts
	getPrompt: typeof handleGetPrompt
	// Expect the actual handler function signature, not the factory
	readResource: (request: ReadResourceRequest) => Promise<ReadResourceResult>
	// Add the list resources handler
	listResources: (request: ListResourcesRequest) => Promise<ListResourcesResult>
}

// Function is exported for use in src/index.ts
export function initializeServer(
	ServerClass = Server,
	TransportClass = StdioServerTransport,
	handlers: ServerHandlers,
): Promise<Server> {
	// Create server instance
	const server = new ServerClass(
		{
			name: config.server.name,
			version: config.server.version,
		},
		{
			capabilities: {
				tools: {},
				prompts: {},
				resources: {},
			},
		},
	)

	// Set up error handling for uncaught exceptions
	process.on('uncaughtException', (err) => {
		log(`ERROR: Uncaught exception: ${err.message}`)
	})

	// Register request handlers
	server.setRequestHandler(ListToolsRequestSchema, handlers.listTools)
	server.setRequestHandler(CallToolRequestSchema, handlers.callTool)

	server.setRequestHandler(ListPromptsRequestSchema, handlers.listPrompts as any)
	server.setRequestHandler(GetPromptRequestSchema, handlers.getPrompt as any)

	server.setRequestHandler(ListResourcesRequestSchema, handlers.listResources)
	server.setRequestHandler(ReadResourceRequestSchema, handlers.readResource)

	// Connect to stdio transport
	const transport = new TransportClass()

	return server
		.connect(transport)
		.then(() => {
			log('INFO: Server connected to stdio transport')
			return server
		})
		.catch((err) => {
			log(`ERROR: Error connecting to transport: ${err}`)
			// eslint-disable-next-line custom-rules/no-throw-statements
			throw err
		})
}
