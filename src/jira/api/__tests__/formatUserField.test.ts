import { formatUserField } from '../formatUserField'
import { formatUserFieldFromObject, formatUserFieldFromString } from '../utils/userFieldUtils'
import type { log } from '../../../utils/logger'

// Mock logger function
const mockLogger: typeof log = jest.fn()

describe('formatUserField', () => {
	beforeEach(() => {
		// Reset mock before each test
		;(mockLogger as jest.Mock).mockClear()
	})

	// Test cases for null/undefined input
	test('should return undefined for null input', () => {
		expect(formatUserField(null, 'assignee', mockLogger)).toBeUndefined()
	})

	test('should return undefined for undefined input', () => {
		expect(formatUserField(undefined, 'reporter', mockLogger)).toBeUndefined()
	})

	// Test cases for string input
	test('should format a non-empty string to { id: string }', () => {
		const userId = 'test-user-id'
		expect(formatUserField(userId, 'assignee', mockLogger)).toEqual({ id: userId })
	})

	test('should return undefined for an empty string', () => {
		expect(formatUserField('', 'reporter', mockLogger)).toBeUndefined()
	})

	// Test cases for object input
	test('should return the original object if it contains "id"', () => {
		const userObject = { id: 'user123', name: 'Test User' }
		expect(formatUserField(userObject, 'assignee', mockLogger)).toBe(userObject)
	})

	test('should return the original object if it contains "accountId"', () => {
		const userObject = { accountId: 'acc123', displayName: 'Another User' }
		expect(formatUserField(userObject, 'reporter', mockLogger)).toBe(userObject)
	})

	test('should return undefined and log warning for object without id or accountId', () => {
		const invalidObject = { name: 'Invalid User' }
		expect(formatUserField(invalidObject, 'assignee', mockLogger)).toBeUndefined()
		expect(mockLogger).toHaveBeenCalledWith(
			`WARN: assignee field has unexpected object format: ${JSON.stringify(invalidObject)}`,
		)
	})

	// Test cases for unexpected types
	test('should return undefined and log warning for number input', () => {
		expect(formatUserField(123, 'reporter', mockLogger)).toBeUndefined()
		expect(mockLogger).toHaveBeenCalledWith('WARN: reporter field has unexpected type: number')
	})

	test('should return undefined and log warning for boolean input', () => {
		expect(formatUserField(true, 'assignee', mockLogger)).toBeUndefined()
		expect(mockLogger).toHaveBeenCalledWith('WARN: assignee field has unexpected type: boolean')
	})

	test('should return undefined and log warning for array input', () => {
		const arr = ['user1']
		expect(formatUserField(arr, 'assignee', mockLogger)).toBeUndefined()
		expect(mockLogger).toHaveBeenCalledWith(`WARN: assignee field has unexpected object format: ${JSON.stringify(arr)}`)
	})
})

// Direct tests for utility functions
describe('userFieldUtils', () => {
	beforeEach(() => {
		// Reset mock before each test
		;(mockLogger as jest.Mock).mockClear()
	})

	describe('formatUserFieldFromString', () => {
		test('should format non-empty string to object with id', () => {
			expect(formatUserFieldFromString('user123')).toEqual({ id: 'user123' })
		})

		test('should return undefined for empty string', () => {
			expect(formatUserFieldFromString('')).toBeUndefined()
		})
	})

	describe('formatUserFieldFromObject', () => {
		test('should return object with id unchanged', () => {
			const obj = { id: 'user123' }
			expect(formatUserFieldFromObject(obj, 'assignee', mockLogger)).toBe(obj)
		})

		test('should return object with accountId unchanged', () => {
			const obj = { accountId: 'acc123' }
			expect(formatUserFieldFromObject(obj, 'reporter', mockLogger)).toBe(obj)
		})

		test('should return undefined and log warning for object without id or accountId', () => {
			const obj = { name: 'User Name' }
			expect(formatUserFieldFromObject(obj, 'assignee', mockLogger)).toBeUndefined()
			expect(mockLogger).toHaveBeenCalledWith(
				`WARN: assignee field has unexpected object format: ${JSON.stringify(obj)}`,
			)
		})

		test('should handle null within formatUserFieldFromObject', () => {
			const result = formatUserFieldFromObject(null, 'assignee', mockLogger)
			expect(result).toBeUndefined()
			expect(mockLogger).toHaveBeenCalledWith('WARN: assignee field received null unexpectedly in object check.')
		})
	})
})
