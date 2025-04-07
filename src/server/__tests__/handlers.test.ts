import { McpError, ErrorCode as McpErrorCode } from '@modelcontextprotocol/sdk/types.js'
import * as errorHandlers from '../../errors/handlers'
import { ErrorCode } from '../../errors/types'
import * as tools from '../../tools'
import { log } from '../../utils/logger'
import { handleListTools, handleCallTool } from '../handlers'
import type { ErrorResult } from '../../errors/types'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'

// Mock dependencies
jest.mock('../../utils/logger', () => ({
	log: jest.fn(),
}))

jest.mock('../../tools', () => ({
	getAllTools: jest.fn(),
	hasToolByName: jest.fn(),
	getToolExecutor: jest.fn(),
}))

jest.mock('../../errors/handlers', () => {
	const actual = jest.requireActual('../../errors/handlers')
	return {
		...actual,
		safeExecute: jest.fn((callback) => {
			// Execute the callback when calling safeExecute to ensure it's covered
			const callbackResult = callback()
			return Promise.resolve({
				success: true,
				data: callbackResult,
			})
		}),
	}
})

describe('Server Handlers', function () {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('handleListTools', function () {
		it('should return a list of tools successfully', async function () {
			// Arrange
			const mockTools: Tool[] = [
				{
					name: 'echo',
					description: 'Test tool',
					inputSchema: {
						type: 'object',
						properties: {},
					},
				},
				{
					name: 'other',
					description: 'Another tool',
					inputSchema: {
						type: 'object',
						properties: {},
					},
				},
			]

			jest.spyOn(tools, 'getAllTools').mockReturnValue(mockTools)

			// Act
			const result = await handleListTools()

			// Assert
			expect(result).toEqual({ tools: mockTools })
			expect(errorHandlers.safeExecute).toHaveBeenCalled()
			expect(log).toHaveBeenCalledWith('DEBUG: Handling list tools request')

			// Verify that getAllTools was called - this ensures the callback was executed
			expect(tools.getAllTools).toHaveBeenCalled()
		})

		it('should throw an error when safeExecute fails', async function () {
			// Arrange
			const mockError: ErrorResult = {
				success: false,
				error: {
					code: ErrorCode.SERVER_ERROR,
					message: 'Failed to get tools',
				},
			}

			jest.spyOn(errorHandlers, 'safeExecute').mockResolvedValue(mockError)

			// Act & Assert
			await expect(handleListTools()).rejects.toThrow(McpError)
			expect(errorHandlers.safeExecute).toHaveBeenCalled()
		})
	})

	describe('handleCallTool', function () {
		it('should successfully call a tool with parameters', async function () {
			// Arrange
			const mockRequest = {
				params: {
					name: 'echo',
					parameters: { message: 'test' },
				},
			}

			const mockResult = {
				content: [{ type: 'text', text: 'test' }],
			}

			const mockExecutor = jest.fn().mockResolvedValue(mockResult)

			jest.spyOn(tools, 'hasToolByName').mockReturnValue(true)
			jest.spyOn(tools, 'getToolExecutor').mockReturnValue(mockExecutor)

			// Act
			const result = await handleCallTool(mockRequest)

			// Assert
			expect(result).toEqual(mockResult)
			expect(tools.hasToolByName).toHaveBeenCalledWith('echo')
			expect(tools.getToolExecutor).toHaveBeenCalledWith('echo')
			expect(mockExecutor).toHaveBeenCalledWith({ arguments: { message: 'test' } })
			expect(log).toHaveBeenCalledWith(expect.stringContaining('Handling call tool request'))
		})

		it('should handle both parameters and arguments', async function () {
			// Arrange
			const mockRequest = {
				params: {
					name: 'echo',
					parameters: { param1: 'value1', arg1: 'argvalue1' },
				},
			}

			const mockResult = {
				content: [{ type: 'text', text: 'test' }],
			}

			const mockExecutor = jest.fn().mockResolvedValue(mockResult)

			jest.spyOn(tools, 'hasToolByName').mockReturnValue(true)
			jest.spyOn(tools, 'getToolExecutor').mockReturnValue(mockExecutor)

			// Act
			const result = await handleCallTool(mockRequest)

			// Assert
			expect(result).toEqual(mockResult)
			expect(mockExecutor).toHaveBeenCalledWith({
				arguments: {
					param1: 'value1',
					arg1: 'argvalue1',
				},
			})
		})

		it('should handle case with no parameters or arguments', async function () {
			// Arrange
			const mockRequest = {
				params: {
					name: 'echo',
				},
			}

			const mockResult = {
				content: [{ type: 'text', text: 'test' }],
			}

			const mockExecutor = jest.fn().mockResolvedValue(mockResult)

			jest.spyOn(tools, 'hasToolByName').mockReturnValue(true)
			jest.spyOn(tools, 'getToolExecutor').mockReturnValue(mockExecutor)

			// Act
			const result = await handleCallTool(mockRequest)

			// Assert
			expect(result).toEqual(mockResult)
			expect(mockExecutor).toHaveBeenCalledWith({ arguments: {} })
		})

		it('should successfully call a tool without parameters provided', async function () {
			// Arrange
			const mockRequest = {
				params: {
					name: 'echo',
				},
			}

			const mockResult = {
				content: [{ type: 'text', text: 'test without params' }],
			}

			const mockExecutor = jest.fn().mockResolvedValue(mockResult)

			jest.spyOn(tools, 'hasToolByName').mockReturnValue(true)
			jest.spyOn(tools, 'getToolExecutor').mockReturnValue(mockExecutor)

			// Act
			const result = await handleCallTool(mockRequest)

			// Assert
			expect(result).toEqual(mockResult)
			expect(tools.hasToolByName).toHaveBeenCalledWith('echo')
			expect(tools.getToolExecutor).toHaveBeenCalledWith('echo')
			expect(mockExecutor).toHaveBeenCalledWith({ arguments: {} })
			expect(log).toHaveBeenCalledWith(expect.stringContaining('Handling call tool request'))
		})

		it('should handle explicitly null parameters', async function () {
			// Arrange
			const mockRequest = {
				params: {
					name: 'echo',
					parameters: null,
				},
			}

			const mockResult = {
				content: [{ type: 'text', text: 'null params test' }],
			}

			const mockExecutor = jest.fn().mockResolvedValue(mockResult)

			jest.spyOn(tools, 'hasToolByName').mockReturnValue(true)
			jest.spyOn(tools, 'getToolExecutor').mockReturnValue(mockExecutor)

			// Act
			const result = await handleCallTool(mockRequest as any)

			// Assert
			expect(result).toEqual(mockResult)
			expect(mockExecutor).toHaveBeenCalledWith({ arguments: {} })
		})

		it('should throw an error when the tool is not found', async function () {
			// Arrange
			const mockRequest = {
				params: {
					name: 'nonexistent',
					parameters: {},
				},
			}

			jest.spyOn(tools, 'hasToolByName').mockReturnValue(false)

			// Act & Assert
			await expect(handleCallTool(mockRequest)).rejects.toThrow(
				new McpError(McpErrorCode.MethodNotFound, 'Tool not found: nonexistent'),
			)
			expect(tools.hasToolByName).toHaveBeenCalledWith('nonexistent')
			expect(log).toHaveBeenCalledWith(expect.stringContaining('Tool not found'))
		})

		it('should throw an error when the tool executor is not found', async function () {
			// Arrange
			const mockRequest = {
				params: {
					name: 'echo',
					parameters: {},
				},
			}

			jest.spyOn(tools, 'hasToolByName').mockReturnValue(true)
			jest.spyOn(tools, 'getToolExecutor').mockReturnValue(null)

			// Act & Assert
			await expect(handleCallTool(mockRequest)).rejects.toThrow(
				new McpError(McpErrorCode.InternalError, 'Tool executor not found'),
			)
			expect(tools.hasToolByName).toHaveBeenCalledWith('echo')
			expect(tools.getToolExecutor).toHaveBeenCalledWith('echo')
			expect(log).toHaveBeenCalledWith(expect.stringContaining('Tool executor not found'))
		})

		it('should throw an error when the tool execution fails', async function () {
			// Arrange
			const mockRequest = {
				params: {
					name: 'echo',
					parameters: { message: 'test' },
				},
			}

			const mockError = new Error('Execution error')
			const mockExecutor = jest.fn().mockRejectedValue(mockError)

			jest.spyOn(tools, 'hasToolByName').mockReturnValue(true)
			jest.spyOn(tools, 'getToolExecutor').mockReturnValue(mockExecutor)

			// Act & Assert
			await expect(handleCallTool(mockRequest)).rejects.toThrow(
				new McpError(McpErrorCode.InternalError, 'Error executing tool: Error: Execution error'),
			)
			expect(mockExecutor).toHaveBeenCalledWith({ arguments: { message: 'test' } })
			expect(log).toHaveBeenCalledWith(expect.stringContaining('Error executing tool'))
		})
	})
})
