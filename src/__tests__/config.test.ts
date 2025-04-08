import { getFilePathFromEnv, loadEnvConfig, config } from '../config'

describe('Config Module', function () {
	describe('getFilePathFromEnv', function () {
		it('should return log file path when LOG_FILE_PATH is set', function () {
			// Set environment variable
			process.env.LOG_FILE_PATH = '/path/to/logs'

			// Test function
			const result = getFilePathFromEnv()

			// Verify result
			expect(result).toBe('/path/to/logs')
		})

		it('should return undefined when LOG_FILE_PATH is not set', function () {
			// Delete environment variable if exists
			delete process.env.LOG_FILE_PATH

			// Test function
			const result = getFilePathFromEnv()

			// Verify result is undefined
			expect(result).toBeUndefined()
		})
	})

	describe('loadEnvConfig', function () {
		it('should use default tool list', function () {
			// Call loadEnvConfig
			const result = loadEnvConfig()

			// Verify default tools are used
			expect(result.tools?.enabledTools).toEqual([
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
			])
		})
	})

	describe('config', function () {
		it('should have expected structure', function () {
			// Verify config has expected structure
			expect(config).toHaveProperty('server.name')
			expect(config).toHaveProperty('server.version')
			expect(config).toHaveProperty('logging.filePath')
			expect(config).toHaveProperty('tools.enabledTools')
		})
	})
})
