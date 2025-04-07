import { processRequestParameters } from '../utils'

describe('Server Utils', function () {
	describe('processRequestParameters', function () {
		it('should process request with only parameters', function () {
			// Arrange
			const request = {
				params: {
					name: 'test-tool',
					parameters: { param1: 'value1', param2: 'value2' },
				},
			}

			// Act
			const result = processRequestParameters(request)

			// Assert
			expect(result.name).toBe('test-tool')
			expect(result.parameters).toEqual({ param1: 'value1', param2: 'value2' })
		})

		it('should process request with only arguments', function () {
			// Arrange
			const request = {
				params: {
					name: 'test-tool',
					arguments: { arg1: 'argvalue1', arg2: 'argvalue2' },
				},
			}

			// Act
			const result = processRequestParameters(request)

			// Assert
			expect(result.name).toBe('test-tool')
			// Arguments are now flattened instead of nested
			expect(result.parameters).toEqual({ arg1: 'argvalue1', arg2: 'argvalue2' })
		})

		it('should process request with both parameters and arguments', function () {
			// Arrange
			const request = {
				params: {
					name: 'test-tool',
					parameters: { param1: 'value1', param2: 'value2' },
					arguments: { arg1: 'argvalue1', arg2: 'argvalue2' },
				},
			}

			// Act
			const result = processRequestParameters(request)

			// Assert
			expect(result.name).toBe('test-tool')
			// Arguments are now flattened alongside parameters
			expect(result.parameters).toEqual({
				param1: 'value1',
				param2: 'value2',
				arg1: 'argvalue1',
				arg2: 'argvalue2',
			})
		})

		it('should process request with neither parameters nor arguments', function () {
			// Arrange
			const request = {
				params: {
					name: 'test-tool',
				},
			}

			// Act
			const result = processRequestParameters(request)

			// Assert
			expect(result.name).toBe('test-tool')
			expect(result.parameters).toEqual({})
		})

		it('should handle parameter conflicts by preferring arguments', function () {
			// Arrange
			const request = {
				params: {
					name: 'test-tool',
					parameters: { shared: 'from-parameters', unique1: 'value1' },
					arguments: { shared: 'from-arguments', unique2: 'value2' },
				},
			}

			// Act
			const result = processRequestParameters(request)

			// Assert
			expect(result.name).toBe('test-tool')
			// In case of conflicts, arguments values should win
			expect(result.parameters).toEqual({
				shared: 'from-arguments',
				unique1: 'value1',
				unique2: 'value2',
			})
		})
	})
})
