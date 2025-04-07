/**
 * Object Value Extractor
 *
 * This utility extracts numeric values from complex object structures commonly found in Jira fields.
 * It specifically handles objects with a 'value' property, which is a common pattern in Jira's
 * custom field representations. The module provides type-safe extraction of these nested values,
 * handling edge cases and ensuring that the resulting data is properly validated as a number.
 * This extraction is critical for consistent processing of story points and other numeric data
 * across different Jira field representations.
 */
import { isValidNumber } from './isValidNumber'

/**
 * Handle object with value property
 * @param field Object to extract value from
 * @returns Number value or null
 */
export function extractObjectValue(field: object): number | null {
	if ('value' in field) {
		return isValidNumber((field as { value: unknown }).value)
	}
	return null
}
