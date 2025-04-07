/**
 * Object ID Validator
 *
 * Validates object values against their allowed values
 */

/**
 * Checks if an object ID exists in the allowed values
 */
function isValidObjectId(id: string, allowedValues: unknown[]): boolean {
	return allowedValues.some(
		(allowed: unknown) =>
			allowed &&
			typeof allowed === 'object' &&
			'id' in (allowed as Record<string, unknown>) &&
			(allowed as Record<string, string>).id === id,
	)
}

/**
 * Validates that a value with an ID property is in the list of allowed values
 */
export function validateObjectWithId(value: unknown, allowedValues: unknown[]): string[] {
	const errors: string[] = []

	if (typeof value !== 'object' || value === null) {
		return errors // This will be caught by the type validator
	}

	// Check if object has an id property
	if ('id' in (value as object)) {
		const valueId = (value as { id: string }).id

		// Find if this ID exists in allowed values
		const isValid = isValidObjectId(valueId, allowedValues)

		if (!isValid) {
			errors.push(`Value with ID "${valueId}" is not in the list of allowed values`)
		}
	} else {
		errors.push('Object value must have an "id" property')
	}

	return errors
}
