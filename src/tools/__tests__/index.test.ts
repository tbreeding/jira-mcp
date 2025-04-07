import { config } from '../../config'
import { log } from '../../utils/logger'
import { getAllTools, getToolExecutor, hasToolByName, initializeToolRegistry, registerTool } from '../index'
import type { StateManager } from '../../tools/issueCreationWizard/stateManager'
import type { ToolExecutor } from '../../types'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'

// Mock dependencies
jest.mock('../../utils/logger', () => ({
	log: jest.fn(),
	LogLevel: {
		DEBUG: 0,
		INFO: 1,
		WARN: 2,
		ERROR: 3,
		NONE: 4,
	},
}))

describe('Tools Registry', function () {
	// Initialize registry before tests
	beforeAll(() => {
		// Make sure log mock is cleared before each test
		jest.clearAllMocks()

		// Create a mock StateManager
		const mockStateManager = {
			isActive: jest.fn().mockReturnValue(false),
			initializeState: jest.fn(),
			getState: jest.fn(),
			resetState: jest.fn(),
			updateState: jest.fn(),
			serializeState: jest.fn(),
			deserializeState: jest.fn(),
			core: {},
		} as unknown as StateManager

		initializeToolRegistry(
			{
				baseUrl: 'https://test-jira.atlassian.net',
				username: 'test-user',
				apiToken: 'test-token',
			},
			mockStateManager,
		)
	})

	describe('getAllTools', function () {
		it('should return all registered tools', function () {
			const tools = getAllTools()

			expect(tools).toBeInstanceOf(Array)
			expect(tools.length).toBeGreaterThan(0)

			// Find getJiraIssue tool in the array
			const jiraToolFound = tools.find((tool) => tool.name === 'getJiraIssue')
			expect(jiraToolFound).toBeDefined()
		})
	})

	describe('getToolExecutor', function () {
		it('should return executor for registered tool', function () {
			const executor = getToolExecutor('getJiraIssue')

			expect(executor).toBeDefined()
			expect(typeof executor).toBe('function')
		})

		it('should return null for unregistered tool', function () {
			const executor = getToolExecutor('nonexistent')

			expect(executor).toBeNull()
		})
	})

	describe('hasToolByName', function () {
		it('should return true for registered tool', function () {
			const hasJiraTool = hasToolByName('getJiraIssue')

			expect(hasJiraTool).toBe(true)
		})

		it('should return false for unregistered tool', function () {
			const hasFake = hasToolByName('fake-tool')

			expect(hasFake).toBe(false)
		})
	})

	describe('registerTool', function () {
		it('should not register disabled tools', function () {
			// Store original config
			const originalEnabledTools = [...config.tools.enabledTools]

			try {
				// Modify config to disable our test tool
				config.tools.enabledTools = ['getJiraIssue'] // Only getJiraIssue is enabled

				// Create a mock tool and executor
				const mockTool: Tool = {
					name: 'disabled-tool',
					description: 'Test disabled tool',
					inputSchema: { type: 'object', properties: {}, required: [] },
				}
				const mockExecutor: ToolExecutor = async () => ({ content: [] })

				// Try to register the disabled tool
				const result = registerTool(mockTool, mockExecutor)

				// Verify it wasn't registered
				expect(result).toBe(false)
				expect(hasToolByName('disabled-tool')).toBe(false)
				expect(log).toHaveBeenCalledWith(expect.stringContaining('disabled in configuration'))
			} finally {
				// Restore original config
				config.tools.enabledTools = originalEnabledTools
			}
		})

		it('should register enabled tools', function () {
			// Store original config
			const originalEnabledTools = [...config.tools.enabledTools]

			try {
				// Modify config to enable our test tool
				config.tools.enabledTools = ['getJiraIssue', 'enabled-test-tool']

				// Create a mock tool and executor
				const mockTool: Tool = {
					name: 'enabled-test-tool',
					description: 'Test enabled tool',
					inputSchema: { type: 'object', properties: {}, required: [] },
				}
				const mockExecutor: ToolExecutor = async () => ({ content: [] })

				// Try to register the enabled tool
				const result = registerTool(mockTool, mockExecutor)

				// Verify it was registered
				expect(result).toBe(true)
				expect(hasToolByName('enabled-test-tool')).toBe(true)
				expect(log).toHaveBeenCalledWith(expect.stringContaining('Registered tool'))
			} finally {
				// Restore original config
				config.tools.enabledTools = originalEnabledTools
			}
		})
	})
})
