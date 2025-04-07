/**
 * Tests for Query String Utilities
 *
 * This module contains tests for the query string utility functions
 * used by the Generic Jira GET tool.
 */

import { buildQueryString } from '../queryStringUtils'

describe('Query String Utilities', () => {
	describe('buildQueryString', () => {
		it('should build a query string from simple parameters', () => {
			expect(buildQueryString({ key1: 'value1', key2: 'value2' })).toBe('?key1=value1&key2=value2')
		})

		it('should handle array parameters', () => {
			expect(buildQueryString({ key: ['value1', 'value2'] })).toBe('?key=value1&key=value2')
		})

		it('should handle object parameters', () => {
			expect(buildQueryString({ key: { prop: 'value' } })).toBe('?key=%7B%22prop%22%3A%22value%22%7D')
		})

		it('should return empty string for empty parameters', () => {
			expect(buildQueryString({})).toBe('')
		})

		it('should return empty string for null parameters', () => {
			expect(buildQueryString(null as unknown as Record<string, unknown>)).toBe('')
		})

		it('should return empty string for undefined parameters', () => {
			expect(buildQueryString(undefined as unknown as Record<string, unknown>)).toBe('')
		})

		it('should skip null and undefined values', () => {
			expect(buildQueryString({ key1: 'value1', key2: null, key3: undefined })).toBe('?key1=value1')
		})

		it('should handle null or undefined items in arrays', () => {
			const result = buildQueryString({ key: ['value1', null, undefined, 'value2'] })
			expect(result).toBe('?key=value1&key=value2')
		})

		it('should handle special characters in parameters', () => {
			expect(buildQueryString({ 'key with spaces': 'value with spaces' })).toBe(
				'?key%20with%20spaces=value%20with%20spaces',
			)
		})

		it('should handle boolean values', () => {
			expect(buildQueryString({ isTrue: true, isFalse: false })).toBe('?isTrue=true&isFalse=false')
		})

		it('should handle numeric values', () => {
			expect(buildQueryString({ id: 123, float: 45.67 })).toBe('?id=123&float=45.67')
		})

		it('should handle empty string values', () => {
			expect(buildQueryString({ empty: '' })).toBe('?empty=')
		})

		it('should handle empty object', () => {
			expect(buildQueryString({})).toBe('')
		})

		it('should handle complex nested structures', () => {
			const params = {
				simple: 'value',
				array: [1, 2, 3],
				object: { a: 1, b: 'test' },
				mixed: [{ x: 1 }, 'string', 42],
			}
			const result = buildQueryString(params)
			expect(result).toContain('?simple=value')
			expect(result).toContain('array=1')
			expect(result).toContain('array=2')
			expect(result).toContain('array=3')
			expect(result).toContain('object=%7B%22a%22%3A1%2C%22b%22%3A%22test%22%7D')
			expect(result).toContain('mixed=%5Bobject%20Object%5D')
			expect(result).toContain('mixed=string')
			expect(result).toContain('mixed=42')
		})

		it('should handle a parameter with zero value', () => {
			expect(buildQueryString({ count: 0 })).toBe('?count=0')
		})

		it('should handle a parameter with empty array', () => {
			expect(buildQueryString({ emptyArray: [] })).toBe('')
		})
	})
})
