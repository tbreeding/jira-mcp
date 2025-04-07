/**
 * Array Validator
 *
 * Validates array values against their allowed values
 */

import { validateObjectWithId } from './objectValidator'
import { validatePrimitiveValue } from './primitiveValidator'

/**
 * Validates a single array item
 */
function validateArrayItem(item: unknown, allowedValues: unknown[], index: number, isObjectWithId: boolean): string[] {
	const errors: string[] = []
	let itemErrors: string[] = []

	if (isObjectWithId) {
		itemErrors = validateObjectWithId(item, allowedValues)
	} else {
		itemErrors = validatePrimitiveValue(item, allowedValues)
	}

	if (itemErrors.length > 0) {
		errors.push(`Item at index ${index}: ${itemErrors.join(', ')}`)
	}

	return errors
}

/**
 * Validates that array values are all in the list of allowed values
 */
export function validateArrayValues(value: unknown, allowedValues: unknown[]): string[] {
	const errors: string[] = []

	if (!Array.isArray(value)) {
		return errors // This will be caught by the type validator
	}

	// For empty arrays, nothing to validate
	if (value.length === 0) {
		return errors
	}

	// Check if values are primitive or objects with IDs
	const firstItem = value[0]
	const isObjectWithId =
		typeof firstItem === 'object' && firstItem !== null && 'id' in (firstItem as Record<string, unknown>)

	// Validate each item in the array
	for (let i = 0; i < value.length; i++) {
		const itemErrors = validateArrayItem(value[i], allowedValues, i, isObjectWithId)
		errors.push(...itemErrors)
	}

	return errors
}
