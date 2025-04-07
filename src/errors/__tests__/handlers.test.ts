import { log } from '../../utils/logger'
import { normalizeError, safeExecute, logError, fromMcpError } from '../handlers'
import { ErrorCode } from '../types'

// Mock the logger
jest.mock('../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('Error Handlers', function () {
	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks()
	})

	describe('normalizeError', function () {
		it('should return the error if it already has the ErrorObject structure', function () {
			const errorObj = {
				code: ErrorCode.UNKNOWN_ERROR,
				message: 'Test error',
			}

			const result = normalizeError(errorObj)

			expect(result).toBe(errorObj)
		})

		it('should convert Error instances to ErrorObject', function () {
			const error = new Error('Test error message')
			const result = normalizeError(error)

			expect(result).toEqual({
				code: ErrorCode.UNKNOWN_ERROR,
				message: 'Test error message',
				originalError: error,
			})
		})

		it('should convert Error instances with empty message', function () {
			const error = new Error('')
			const result = normalizeError(error)

			expect(result).toEqual({
				code: ErrorCode.UNKNOWN_ERROR,
				message: 'An unknown error occurred',
				originalError: error,
			})
		})

		it('should convert string errors to ErrorObject', function () {
			const result = normalizeError('String error')

			expect(result).toEqual({
				code: ErrorCode.UNKNOWN_ERROR,
				message: 'String error',
				originalError: 'String error',
			})
		})

		it('should convert empty string errors to ErrorObject with default message', function () {
			const result = normalizeError('')

			expect(result).toEqual({
				code: ErrorCode.UNKNOWN_ERROR,
				message: 'An unknown error occurred',
				originalError: '',
			})
		})

		it('should convert null to ErrorObject', function () {
			const result = normalizeError(null)

			expect(result).toEqual({
				code: ErrorCode.UNKNOWN_ERROR,
				message: 'null',
				originalError: null,
			})
		})
	})

	describe('safeExecute', function () {
		it('should return success result for successful function', async function () {
			const data = { value: 'test' }
			const fn = jest.fn().mockResolvedValue(data)

			const result = await safeExecute(fn)

			expect(result).toEqual({
				success: true,
				data,
			})
			expect(fn).toHaveBeenCalled()
		})

		it('should return error result for function that throws', async function () {
			const error = new Error('Function failed')
			const fn = jest.fn().mockRejectedValue(error)

			const result = await safeExecute(fn)

			expect(result).toEqual({
				success: false,
				error: {
					code: ErrorCode.UNKNOWN_ERROR,
					message: 'Operation failed',
					metadata: {},
					originalError: error,
				},
			})
			expect(fn).toHaveBeenCalled()
			expect(log).toHaveBeenCalledWith(`ERROR: Operation failed: ${error}`)
		})

		it('should use provided error message and code', async function () {
			const error = new Error('Custom error')
			const fn = jest.fn().mockRejectedValue(error)

			const result = await safeExecute(fn, 'Custom error message', ErrorCode.TOOL_EXECUTION_ERROR)

			expect(result).toEqual({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: 'Custom error message',
					metadata: {},
					originalError: error,
				},
			})
			expect(log).toHaveBeenCalledWith(`ERROR: Custom error message: ${error}`)
		})
	})

	describe('logError', function () {
		it('should log error objects', function () {
			const errorObj = {
				code: ErrorCode.TOOL_EXECUTION_ERROR,
				message: 'Tool failed',
			}

			logError(errorObj)

			expect(log).toHaveBeenCalledWith('ERROR: Error [TOOL_EXECUTION_ERROR]: Tool failed')
		})

		it('should log Error instances', function () {
			const error = new Error('Standard error')

			logError(error)

			expect(log).toHaveBeenCalledWith('ERROR: Error [UNKNOWN_ERROR]: Standard error')
		})

		it('should log errors with metadata', function () {
			const errorWithMetadata = {
				code: ErrorCode.SERVER_ERROR,
				message: 'Server error',
				metadata: { requestId: '123' },
			}

			logError(errorWithMetadata)

			expect(log).toHaveBeenCalledWith('ERROR: Error [SERVER_ERROR]: Server error | Metadata: {"requestId":"123"}')
		})
	})

	describe('fromMcpError', function () {
		it('should convert MCP errors to internal format', function () {
			const mcpError = {
				code: 'MCP_ERROR',
				message: 'MCP failed',
			}

			const result = fromMcpError(mcpError)

			expect(result).toEqual({
				code: 'MCP_ERROR',
				message: 'MCP failed',
				metadata: {
					mcpErrorCode: 'MCP_ERROR',
				},
				originalError: mcpError,
			})
		})

		it('should handle MCP errors with missing code', function () {
			const mcpError = {
				message: 'MCP message only',
			}

			const result = fromMcpError(mcpError)

			expect(result).toEqual({
				code: ErrorCode.UNKNOWN_ERROR,
				message: 'MCP message only',
				metadata: {
					mcpErrorCode: undefined,
				},
				originalError: mcpError,
			})
		})

		it('should handle MCP errors with missing message', function () {
			const mcpError = {
				code: 'MCP_CODE_ONLY',
			}

			const result = fromMcpError(mcpError)

			expect(result).toEqual({
				code: 'MCP_CODE_ONLY',
				message: 'Unknown MCP error',
				metadata: {
					mcpErrorCode: 'MCP_CODE_ONLY',
				},
				originalError: mcpError,
			})
		})

		it('should handle completely empty MCP errors', function () {
			const mcpError = {}

			const result = fromMcpError(mcpError)

			expect(result).toEqual({
				code: ErrorCode.UNKNOWN_ERROR,
				message: 'Unknown MCP error',
				metadata: {
					mcpErrorCode: undefined,
				},
				originalError: mcpError,
			})
		})
	})
})
