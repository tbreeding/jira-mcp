/**
 * Primitive Value Validator
 *
 * Validates primitive values against their allowed values
 */

/**
 * Checks if a primitive value matches an allowed value
 */
function isValidPrimitiveValue(value: unknown, allowedValues: unknown[]): boolean {
	return allowedValues.some((allowed: unknown) => {
		if (allowed && typeof allowed === 'object') {
			// If allowed values are objects, check value or name property
			return (
				('value' in (allowed as Record<string, unknown>) && (allowed as Record<string, unknown>).value === value) ||
				('name' in (allowed as Record<string, unknown>) && (allowed as Record<string, unknown>).name === value)
			)
		}
		return allowed === value
	})
}

/**
 * Validates that a primitive value is in the list of allowed values
 */
export function validatePrimitiveValue(value: unknown, allowedValues: unknown[]): string[] {
	const errors: string[] = []

	// For primitive values, we directly check if it exists in allowed values
	const isValid = isValidPrimitiveValue(value, allowedValues)

	if (!isValid) {
		errors.push(`Value "${String(value)}" is not in the list of allowed values`)
	}

	return errors
}
