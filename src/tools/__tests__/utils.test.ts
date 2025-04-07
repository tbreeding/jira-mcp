import { extractParameter, extractParameters } from '../utils'

jest.mock('../../utils/logger', () => ({
	log: jest.fn(),
}))

describe('Tool Utils', function () {
	describe('extractParameter', function () {
		it('should extract a parameter when it exists', function () {
			// Arrange
			const parameters = {
				arguments: {
					param1: 'value1',
					param2: 'value2',
				},
			}

			// Act
			const result = extractParameter(parameters, 'param1')

			// Assert
			expect(result).toBe('value1')
		})

		it('should return the default value when parameter does not exist', function () {
			// Arrange
			const parameters = {
				arguments: {
					param2: 'value2',
				},
			}
			const defaultValue = 'default-value'

			// Act
			const result = extractParameter(parameters, 'param1', defaultValue)

			// Assert
			expect(result).toBe(defaultValue)
		})

		it('should return the default value when parameters.arguments is undefined', function () {
			// Arrange
			const parameters = {} as { arguments: Record<string, unknown> }
			const defaultValue = 'default-value'

			// Act
			const result = extractParameter(parameters, 'param1', defaultValue)

			// Assert
			expect(result).toBe(defaultValue)
		})

		it('should return the default value when parameters is null', function () {
			// Arrange
			const parameters = null as unknown as { arguments: Record<string, unknown> }
			const defaultValue = 'default-value'

			// Act
			const result = extractParameter(parameters, 'param1', defaultValue)

			// Assert
			expect(result).toBe(defaultValue)
		})

		it('should return undefined when parameter does not exist and no default is provided', function () {
			// Arrange
			const parameters = {
				arguments: {
					param2: 'value2',
				},
			}

			// Act
			const result = extractParameter(parameters, 'param1')

			// Assert
			expect(result).toBeUndefined()
		})
	})

	describe('extractParameters', function () {
		it('should extract all parameters', function () {
			// Arrange
			const parameters = {
				arguments: {
					param1: 'value1',
					param2: 'value2',
				},
			}

			// Act
			const result = extractParameters(parameters)

			// Assert
			expect(result).toEqual({
				param1: 'value1',
				param2: 'value2',
			})
		})

		it('should combine parameters with defaults', function () {
			// Arrange
			const parameters = {
				arguments: {
					param1: 'value1',
					param2: 'value2',
				},
			}
			const defaults = {
				param3: 'default3',
				param4: 'default4',
			}

			// Act
			const result = extractParameters(parameters, defaults)

			// Assert
			expect(result).toEqual({
				param1: 'value1',
				param2: 'value2',
				param3: 'default3',
				param4: 'default4',
			})
		})

		it('should override defaults with actual parameters', function () {
			// Arrange
			const parameters = {
				arguments: {
					param1: 'value1',
					param3: 'override3',
				},
			}
			const defaults = {
				param3: 'default3',
				param4: 'default4',
			}

			// Act
			const result = extractParameters(parameters, defaults)

			// Assert
			expect(result).toEqual({
				param1: 'value1',
				param3: 'override3',
				param4: 'default4',
			})
		})

		it('should return defaults when parameters.arguments is undefined', function () {
			// Arrange
			const parameters = {} as { arguments: Record<string, unknown> }
			const defaults = {
				param3: 'default3',
				param4: 'default4',
			}

			// Act
			const result = extractParameters(parameters, defaults)

			// Assert
			expect(result).toEqual(defaults)
		})

		it('should return empty object when parameters.arguments is undefined and no defaults', function () {
			// Arrange
			const parameters = {} as { arguments: Record<string, unknown> }

			// Act
			const result = extractParameters(parameters)

			// Assert
			expect(result).toEqual({})
		})

		it('should return defaults when parameters is null', function () {
			// Arrange
			const parameters = null as unknown as { arguments: Record<string, unknown> }
			const defaults = {
				param3: 'default3',
				param4: 'default4',
			}

			// Act
			const result = extractParameters(parameters, defaults)

			// Assert
			expect(result).toEqual(defaults)
		})
	})
})
