/**
 * Check if field is a valid number
 * @param value Value to check
 * @returns The number or null if invalid
 */
export function isValidNumber(value: unknown): number | null {
	if (value === null) {
		return null
	}

	// Handle empty arrays
	if (Array.isArray(value)) {
		return null
	}

	const num = Number(value)
	return !isNaN(num) ? num : null
}
