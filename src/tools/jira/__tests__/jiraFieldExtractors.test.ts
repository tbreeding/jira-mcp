/**
 * Tests for jiraFieldExtractors utility functions
 */
import { extractSprints, getNamedProperty, extractParent } from '../jiraFieldExtractors'

describe('jiraFieldExtractors', () => {
	describe('extractSprints', () => {
		test('should extract sprint names from customfield_10600', () => {
			// Arrange
			const fields = {
				customfield_10600: [
					{ name: 'Sprint 1', id: 1, state: 'active', boardId: 101 },
					{ name: 'Sprint 2', id: 2, state: 'closed', boardId: 101 },
				],
			}

			// Act
			const result = extractSprints(fields)

			// Assert
			expect(result).toEqual(['Sprint 1', 'Sprint 2'])
		})

		test('should return empty array when customfield_10600 is not an array', () => {
			// Arrange
			const fields = {
				customfield_10600: 'not an array',
			}

			// Act
			const result = extractSprints(fields)

			// Assert
			expect(result).toEqual([])
		})

		test('should return empty array when customfield_10600 is missing', () => {
			// Arrange
			const fields = {}

			// Act
			const result = extractSprints(fields)

			// Assert
			expect(result).toEqual([])
		})

		test('should filter out non-sprint objects', () => {
			// Arrange
			const fields = {
				customfield_10600: [
					{ name: 'Sprint 1', id: 1 },
					null,
					'not a sprint',
					{ id: 3 }, // no name property
					{ name: 'Sprint 4', id: 4 },
				],
			}

			// Act
			const result = extractSprints(fields)

			// Assert
			expect(result).toEqual(['Sprint 1', 'Sprint 4'])
		})
	})

	describe('getNamedProperty', () => {
		test('should return named property value when it exists', () => {
			// Arrange
			const obj = { name: 'Test Name', id: 123 }

			// Act
			const result = getNamedProperty(obj, 'name')

			// Assert
			expect(result).toBe('Test Name')
		})

		test('should return empty string when property exists but is falsy', () => {
			// Arrange
			const obj = { name: '', id: 123 }

			// Act
			const result = getNamedProperty(obj, 'name')

			// Assert
			expect(result).toBe('')
		})

		test('should return empty string when property does not exist', () => {
			// Arrange
			const obj = { id: 123 }

			// Act
			const result = getNamedProperty(obj, 'name')

			// Assert
			expect(result).toBe('')
		})

		test('should return empty string when obj is null or undefined', () => {
			// Act & Assert
			expect(getNamedProperty(null, 'name')).toBe('')
			expect(getNamedProperty(undefined, 'name')).toBe('')
		})

		test('should return empty string when obj is not an object', () => {
			// Act & Assert
			expect(getNamedProperty('string', 'name')).toBe('')
			expect(getNamedProperty(123, 'name')).toBe('')
			expect(getNamedProperty(true, 'name')).toBe('')
		})
	})

	describe('extractParent', () => {
		test('should extract parent key and summary', () => {
			// Arrange
			const fields = {
				parent: {
					key: 'PROJ-100',
					fields: {
						summary: 'Parent Issue',
					},
				},
			}

			// Act
			const result = extractParent(fields)

			// Assert
			expect(result).toEqual({
				key: 'PROJ-100',
				summary: 'Parent Issue',
			})
		})

		test('should return undefined when parent field is missing', () => {
			// Arrange
			const fields = {}

			// Act
			const result = extractParent(fields)

			// Assert
			expect(result).toBeUndefined()
		})

		test('should return undefined when parent is not an object', () => {
			// Arrange
			const fields = {
				parent: 'not an object',
			}

			// Act
			const result = extractParent(fields)

			// Assert
			expect(result).toBeUndefined()
		})

		test('should handle missing parent fields gracefully', () => {
			// Arrange - parent exists but is missing fields
			const fields = {
				parent: {
					key: 'PROJ-100',
					// no fields property
				},
			}

			// Act
			const result = extractParent(fields)

			// Assert
			expect(result).toEqual({
				key: 'PROJ-100',
				summary: '',
			})
		})

		test('should handle missing key or summary gracefully', () => {
			// Arrange - fields exists but missing summary
			const fields = {
				parent: {
					// no key
					fields: {
						// no summary
					},
				},
			}

			// Act
			const result = extractParent(fields)

			// Assert
			expect(result).toEqual({
				key: '',
				summary: '',
			})
		})
	})
})
