/**
 * Configuration validation utilities for Jira integration
 *
 * This file provides functions to validate that Jira API configuration
 * settings are properly formatted and contain all required fields before
 * attempting API connections.
 */

import { ok } from 'assert'
import { log } from '../../utils/logger'
import type { JiraApiConfig } from '../api/apiTypes'

/**
 * Validate Jira configuration from command-line arguments
 * @param argsConfig - Configuration from command-line arguments
 * @returns Validated configuration
 * @throws Error if configuration is invalid
 */
export function validateJiraConfig(args: string[]): JiraApiConfig {
	const argsConfig = parseArgs(args)
	// Validate required fields from command-line arguments
	ok(argsConfig.baseUrl, 'Missing Jira base URL (use --jira-base-url=URL)')
	ok(argsConfig.username, 'Missing Jira username (use --jira-username=USER)')
	ok(argsConfig.apiToken, 'Missing Jira API token (use --jira-api-token=TOKEN)')

	// Log token info for debugging but don't expose the actual token
	if (argsConfig.apiToken) {
		log(`DEBUG: API token loaded with length: ${argsConfig.apiToken.length}`)
	}

	return {
		baseUrl: argsConfig.baseUrl,
		username: argsConfig.username,
		apiToken: argsConfig.apiToken,
	}
}

/**
 * Parse command line arguments
 * Expected format: --jira-base-url=URL --jira-username=USER --jira-api-token=TOKEN
 */
function parseArgs(args: string[]): Partial<JiraApiConfig> {
	const config: Partial<JiraApiConfig> = {}

	// Extract config values from command line arguments
	args.forEach((arg) => {
		if (arg.startsWith('--jira-base-url=')) {
			config.baseUrl = arg.substring('--jira-base-url='.length)
		} else if (arg.startsWith('--jira-username=')) {
			config.username = arg.substring('--jira-username='.length)
		} else if (arg.startsWith('--jira-api-token=')) {
			config.apiToken = arg.substring('--jira-api-token='.length)
		}
	})

	// Log found arguments
	log(
		`DEBUG: Command line arguments: baseUrl=${config.baseUrl ? 'set' : 'not set'}, ` +
			`username=${config.username ? 'set' : 'not set'}, ` +
			`apiToken=${config.apiToken ? `set (length: ${config.apiToken.length})` : 'not set'}`,
	)

	return config
}
