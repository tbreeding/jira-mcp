#!/usr/bin/env node

// Register module aliases
import 'module-alias/register'
import { validateJiraConfig } from './jira/config/validation'
import { handleGetPrompt } from './prompts/handlers/get.handler'
import { handleListPrompts } from './prompts/handlers/list.handler'
import { jiraResourceDefinitions } from './resources/definitions/jira.resource'
import { createListResourcesHandler } from './resources/handlers/list.handler'
import { createReadResourceHandler } from './resources/handlers/read.handler'
import { initializeServer } from './server'
import { handleCallTool, handleListTools } from './server/handlers'
import { initializeToolRegistry } from './tools'
import { StateManager } from './tools/issueCreationWizard/stateManager'
import { StateManagerCore } from './tools/issueCreationWizard/stateManagerCore'
import { log } from './utils/logger'
// TODO: Import ServerHandlers from ./server/types.ts when created

/**
 * Bootstrap the application
 */
function bootstrap(): void {
	log('Starting jira-mcp server')

	try {
		log(JSON.stringify(process.argv))
		// Parse command line arguments first
		const jiraConfig = validateJiraConfig(process.argv)

		log(
			`INFO: Jira configuration validated successfully: { "baseUrl": "${jiraConfig.baseUrl}", ` +
				`"username": "${jiraConfig.username}", "apiToken": "***" }`,
		)

		// Create state manager for issue creation wizard
		const stateManagerCore = new StateManagerCore()
		const stateManager = new StateManager(stateManagerCore)
		log('INFO: StateManager initialized successfully')

		// Create resource definitions array
		const allResourceDefinitions = [...jiraResourceDefinitions]

		// Initialize tools registry with validated config and state manager
		initializeToolRegistry(jiraConfig, stateManager)

		// Create resource handlers with config and definitions
		const readResourceHandler = createReadResourceHandler(jiraConfig, allResourceDefinitions)
		const listResourcesHandler = createListResourcesHandler(allResourceDefinitions)

		// Define handlers object conforming to ServerHandlers interface (implicitly)
		const handlers = {
			listTools: handleListTools,
			callTool: handleCallTool,
			listPrompts: handleListPrompts,
			getPrompt: handleGetPrompt,
			readResource: readResourceHandler,
			listResources: listResourcesHandler,
		}

		// Initialize and start the server with configured handlers
		initializeServer(undefined, undefined, handlers)
			.then(() => {
				log('INFO: Server started successfully')
			})
			.catch((err: Error) => {
				log(`ERROR: Failed to initialize server: ${err}`)
				process.exit(1)
			})
	} catch (error) {
		// Log the configuration error and exit
		log(`ERROR: ${error instanceof Error ? error.message : 'Invalid Jira configuration'}`)
		log('ERROR: Cannot start the application without valid Jira configuration')
		process.exit(1)
	}
}

// Start the application
bootstrap()
