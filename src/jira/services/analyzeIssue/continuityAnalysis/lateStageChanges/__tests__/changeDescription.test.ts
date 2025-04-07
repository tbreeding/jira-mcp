import { getChangeDescription } from '../changeDescription'

describe('getChangeDescription', () => {
	test('should create description with valid values', () => {
		// Arrange
		const item = {
			field: 'status',
			fromString: 'To Do',
			toString: 'In Progress',
		}

		// Act
		const result = getChangeDescription(item)

		// Assert
		expect(result).toBe('Changed status from "To Do" to "In Progress"')
	})

	test('should handle null fromString', () => {
		// Arrange
		const item = {
			field: 'assignee',
			fromString: null,
			toString: 'jane.doe',
		}

		// Act
		const result = getChangeDescription(item)

		// Assert
		expect(result).toBe('Changed assignee from "none" to "jane.doe"')
	})

	test('should handle null toString', () => {
		// Arrange
		const item = {
			field: 'assignee',
			fromString: 'john.doe',
			toString: null,
		}

		// Act
		const result = getChangeDescription(item)

		// Assert
		expect(result).toBe('Changed assignee from "john.doe" to "none"')
	})

	test('should handle both null values', () => {
		// Arrange
		const item = {
			field: 'custom-field',
			fromString: null,
			toString: null,
		}

		// Act
		const result = getChangeDescription(item)

		// Assert
		expect(result).toBe('Changed custom-field from "none" to "none"')
	})
})
