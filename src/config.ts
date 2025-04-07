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
			'mcp_IssueCreationWizard_getState',
			'mcp_IssueCreationWizard_getStatus',
			'mcp_IssueCreationWizard_initiateState',
			'mcp_IssueCreationWizard_resetState',
			'mcp_IssueCreationWizard_updateState',
			'mcp_IssueCreationWizard_createIssue',
			'mcp_IssueCreationWizard_getProjects',
			'mcp_IssueCreationWizard_getIssueTypes',
			'mcp_IssueCreationWizard_getFields',
			'mcp_IssueCreationWizard_updateFields',
			'mcp_IssueCreationWizard_setAnalysisComplete',
			'mcp_IssueCreationWizard_setUserConfirmation',
			'mcp_IssueCreationWizard_analyzeIssue',
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
