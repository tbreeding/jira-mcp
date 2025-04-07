/**
 * Numeric Value Extractor
 *
 * This utility extracts numeric values from Jira field data that may be represented in various formats.
 * It handles different data structures, including direct numbers, objects with value properties,
 * and custom field representations. The module provides robust type handling to safely extract
 * meaningful numeric data from inconsistent field formats, ensuring that story points and other
 * numeric values can be reliably used for calculations and metrics regardless of their source format.
 */
import { extractObjectValue } from './extractObjectValue'

/**
 * Extract a numeric value from a field that might be a number or an object with a value property
 * @param field The field to extract from
 * @returns Number value or null if not a valid number
 */
export function extractNumericValue(field: unknown): number | null {
	if (field === null || field === undefined) {
		return null
	}

	if (typeof field === 'number') {
		return field
	}

	if (typeof field === 'object' && field !== null) {
		return extractObjectValue(field)
	}

	return null
}
