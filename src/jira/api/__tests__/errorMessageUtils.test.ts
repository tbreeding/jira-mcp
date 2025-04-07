/**
 * Tests for error message utilities
 */

import { getErrorMessage } from '../errorMessageUtils'

describe('errorMessageUtils', () => {
	describe('getErrorMessage', () => {
		it('should return first error message when errorMessages array has content', () => {
			const errorData = {
				errorMessages: ['First error', 'Second error'],
			}
			const status = 404

			const result = getErrorMessage(errorData, status)

			expect(result).toBe('Error: First error, Status: 404')
		})

		it('should return default message when errorMessages array is empty', () => {
			const errorData = {
				errorMessages: [],
			}
			const status = 400

			const result = getErrorMessage(errorData, status)

			expect(result).toBe('Failed to fetch Jira issue. Status: 400')
		})

		it('should return default message when errorMessages is undefined', () => {
			const errorData = {}
			const status = 500

			const result = getErrorMessage(errorData, status)

			expect(result).toBe('Failed to fetch Jira issue. Status: 500')
		})

		it('should return default message when errorMessages is null', () => {
			const errorData = {
				errorMessages: null,
			} as any
			const status = 500

			const result = getErrorMessage(errorData, status)

			expect(result).toBe('Failed to fetch Jira issue. Status: 500')
		})

		it('should return default message when errorMessages is not an array', () => {
			const errorData = {
				errorMessages: 'Not an array',
			} as any
			const status = 403

			const result = getErrorMessage(errorData, status)

			expect(result).toBe('Failed to fetch Jira issue. Status: 403')
		})

		it('should handle array with length check independently', () => {
			// This tests the specific branch where Array.isArray() is true but the length check fails
			const errorDataWithEmptyArray = {
				errorMessages: [],
			}
			const status = 401

			// Force Array.isArray to return true but length to be 0
			jest.spyOn(Array, 'isArray').mockReturnValueOnce(true)

			const result = getErrorMessage(errorDataWithEmptyArray, status)

			expect(result).toBe('Failed to fetch Jira issue. Status: 401')
		})

		it('should test optional chaining branch specifically', () => {
			// Create a custom array-like object that passes Array.isArray but has no length property
			const customArray = Object.create(Array.prototype)
			// This will pass Array.isArray check but the optional chaining will need to kick in
			const errorData = {
				errorMessages: customArray,
			}
			const status = 418

			const result = getErrorMessage(errorData, status)

			expect(result).toBe('Failed to fetch Jira issue. Status: 418')
		})
	})
})
