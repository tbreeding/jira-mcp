import { validateJiraConfig } from '../validation'

// Mock the log function
jest.mock('../../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('Jira Config Validation', function () {
	// Reset mocks after each test
	afterEach(() => {
		jest.resetAllMocks()
	})

	describe('validateJiraConfig', function () {
		it('should return valid config when all command line arguments are provided', function () {
			// Set up test arguments
			const args = [
				'node',
				'script.js',
				'--jira-base-url=https://test-jira.atlassian.net',
				'--jira-username=test-user',
				'--jira-api-token=test-token',
			]

			// Call function
			const config = validateJiraConfig(args)

			// Verify result
			expect(config).toEqual({
				baseUrl: 'https://test-jira.atlassian.net',
				username: 'test-user',
				apiToken: 'test-token',
			})
		})

		it('should throw error when base URL is missing', function () {
			// Set up args with missing base URL
			const args = ['node', 'script.js', '--jira-username=test-user', '--jira-api-token=test-token']

			// Verify function throws error
			expect(() => validateJiraConfig(args)).toThrow('Missing Jira base URL')
		})

		it('should throw error when username is missing', function () {
			// Set up args with missing username
			const args = [
				'node',
				'script.js',
				'--jira-base-url=https://test-jira.atlassian.net',
				'--jira-api-token=test-token',
			]

			// Verify function throws error
			expect(() => validateJiraConfig(args)).toThrow('Missing Jira username')
		})

		it('should throw error when API token is missing', function () {
			// Set up args with missing API token
			const args = ['node', 'script.js', '--jira-base-url=https://test-jira.atlassian.net', '--jira-username=test-user']

			// Verify function throws error
			expect(() => validateJiraConfig(args)).toThrow('Missing Jira API token')
		})
	})
})
