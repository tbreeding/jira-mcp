/**
 * Application configuration
 */
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

interface AppConfig {
	server: {
		name: string
		version: string
	}
	logging: {
		filePath?: string
	}
	tools: {
		enabledTools: string[]
	}
}

// Default configuration
const defaultConfig: AppConfig = {
	server: {
		name: 'jira-mcp',
		version: '0.1.0',
	},
	logging: {},
	tools: {
		enabledTools: [
			'getJiraIssue',
			'analyzeJiraIssue',
			'jiraGet',
			'getIssuesByJql',
			// Issue Creation Wizard tools
			'issueCreation_getState',
			'issueCreation_getStatus',
			'issueCreation_initiateState',
			'issueCreation_resetState',
			'issueCreation_updateState',
			'issueCreation_createIssue',
			'issueCreation_getProjects',
			'issueCreation_getIssueTypes',
			'issueCreation_getFields',
			'issueCreation_updateFields',
			'issueCreation_setAnalysisComplete',
			'issueCreation_setUserConfirmation',
			'issueCreation_analyzeIssue',
			// Issue Update Wizard tools
			'issueUpdateWizard_updateIssueFromState',
			'issueUpdateWizard_loadIssueIntoState',
		],
	},
}

// Parse log level from environment variable
export function getFilePathFromEnv(): string | undefined {
	return process.env.LOG_FILE_PATH
}

// Environment-based configuration overrides
export function loadEnvConfig(): Partial<AppConfig> {
	return {
		logging: {
			filePath: getFilePathFromEnv(),
		},
		tools: {
			enabledTools: defaultConfig.tools.enabledTools,
		},
	}
}

// Merge default and environment configs
export const config: AppConfig = {
	...defaultConfig,
	...loadEnvConfig(),
	logging: {
		...defaultConfig.logging,
		...loadEnvConfig().logging,
	},
	tools: {
		...defaultConfig.tools,
		...loadEnvConfig().tools,
	},
}
