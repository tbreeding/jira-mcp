/**
 * Issue Creation Wizard Tool Utilities Tests
 *
 * This module contains unit tests for the utility functions used by the
 * Issue Creation Wizard tools. It ensures that the success and error result
 * formatting functions work correctly.
 */

import { createSuccessResult, createErrorResult, createProcessSuccessResult, createProcessErrorResult } from '../utils'

describe('Issue Creation Wizard Tool Utilities', () => {
	describe('createSuccessResult', () => {
		test('should create proper success result structure', () => {
			const data = { foo: 'bar' }
			const result = createSuccessResult(data)

			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: JSON.stringify(data, null, 2),
					},
				],
			})
		})

		test('should properly format complex data structures', () => {
			const complexData = {
				nested: {
					array: [1, 2, 3],
					object: { a: 1, b: 2 },
				},
				string: 'value',
				number: 42,
				boolean: true,
				null: null,
			}

			const result = createSuccessResult(complexData)

			expect(result.content).toHaveLength(1)
			expect(result.content[0].type).toBe('text')
			expect(JSON.parse(result.content[0].text)).toEqual(complexData)
		})
	})

	describe('createErrorResult', () => {
		test('should create proper error result structure', () => {
			const errorMessage = 'Something went wrong'
			const result = createErrorResult(errorMessage)

			expect(result).toEqual({
				content: [
					{
						type: 'text',
						text: `Error: ${errorMessage}`,
					},
				],
				isError: true,
			})
		})

		test('should properly format error messages', () => {
			const errorMessage = 'Invalid input data'
			const result = createErrorResult(errorMessage)

			expect(result.content).toHaveLength(1)
			expect(result.content[0].type).toBe('text')
			expect(result.content[0].text).toBe(`Error: ${errorMessage}`)
			expect(result.isError).toBe(true)
		})

		test('should handle empty error messages', () => {
			const result = createErrorResult('')

			expect(result.content[0].text).toBe('Error: ')
			expect(result.isError).toBe(true)
		})
	})

	describe('createProcessSuccessResult', () => {
		test('should create proper process success result structure', () => {
			const data = { foo: 'bar' }
			const result = createProcessSuccessResult(data)

			expect(result).toEqual({
				success: true,
				message: 'Operation completed successfully',
				foo: 'bar',
			})
		})

		test('should use provided message when available', () => {
			const data = {
				message: 'Custom success message',
				foo: 'bar',
			}
			const result = createProcessSuccessResult(data)

			expect(result).toEqual({
				success: true,
				message: 'Custom success message',
				foo: 'bar',
			})
		})

		test('should use default message when message is not provided', () => {
			const data = { foo: 'bar' }
			const result = createProcessSuccessResult(data)

			expect(result.success).toBe(true)
			expect(result.message).toBe('Operation completed successfully')
			expect(result.foo).toBe('bar')
		})
	})

	describe('createProcessErrorResult', () => {
		test('should create proper process error result structure', () => {
			const errorMessage = 'An error occurred during processing'
			const result = createProcessErrorResult(errorMessage)

			expect(result).toEqual({
				success: false,
				message: errorMessage,
			})
		})

		test('should handle empty error messages', () => {
			const result = createProcessErrorResult('')

			expect(result).toEqual({
				success: false,
				message: '',
			})
		})
	})
})
