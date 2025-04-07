import { ErrorCode, ErrorSeverity, createSuccess, createError } from '../types'

describe('Error Types', function () {
	describe('ErrorCode enum', function () {
		it('should define all expected error codes', function () {
			expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR')
			expect(ErrorCode.INVALID_PARAMETERS).toBe('INVALID_PARAMETERS')
			expect(ErrorCode.TOOL_NOT_FOUND).toBe('TOOL_NOT_FOUND')
			expect(ErrorCode.TOOL_EXECUTION_ERROR).toBe('TOOL_EXECUTION_ERROR')
			expect(ErrorCode.REQUEST_VALIDATION_ERROR).toBe('REQUEST_VALIDATION_ERROR')
			expect(ErrorCode.SERVER_ERROR).toBe('SERVER_ERROR')
		})
	})

	describe('ErrorSeverity enum', function () {
		it('should define all expected severity levels', function () {
			expect(ErrorSeverity.LOW).toBe('LOW')
			expect(ErrorSeverity.MEDIUM).toBe('MEDIUM')
			expect(ErrorSeverity.HIGH).toBe('HIGH')
			expect(ErrorSeverity.CRITICAL).toBe('CRITICAL')
		})
	})

	describe('createSuccess', function () {
		it('should create a success result object', function () {
			const data = { id: 1, name: 'test' }
			const result = createSuccess(data)

			expect(result).toEqual({
				success: true,
				data,
			})
		})
	})

	describe('createError', function () {
		it('should create an error result with minimal parameters', function () {
			const result = createError(ErrorCode.UNKNOWN_ERROR, 'An error occurred')

			expect(result).toEqual({
				success: false,
				error: {
					code: ErrorCode.UNKNOWN_ERROR,
					message: 'An error occurred',
				},
			})
		})

		it('should create an error result with metadata', function () {
			const metadata = { requestId: '123', endpoint: '/test' }
			const result = createError(ErrorCode.SERVER_ERROR, 'Server error', metadata)

			expect(result).toEqual({
				success: false,
				error: {
					code: ErrorCode.SERVER_ERROR,
					message: 'Server error',
					metadata,
				},
			})
		})

		it('should create an error result with original error', function () {
			const originalError = new Error('Original error')
			const result = createError(ErrorCode.TOOL_EXECUTION_ERROR, 'Tool execution failed', undefined, originalError)

			expect(result).toEqual({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: 'Tool execution failed',
					originalError,
				},
			})
		})

		it('should create an error result with all parameters', function () {
			const metadata = { toolName: 'test' }
			const originalError = new Error('Original error')
			const result = createError(ErrorCode.TOOL_EXECUTION_ERROR, 'Tool execution failed', metadata, originalError)

			expect(result).toEqual({
				success: false,
				error: {
					code: ErrorCode.TOOL_EXECUTION_ERROR,
					message: 'Tool execution failed',
					metadata,
					originalError,
				},
			})
		})
	})
})
