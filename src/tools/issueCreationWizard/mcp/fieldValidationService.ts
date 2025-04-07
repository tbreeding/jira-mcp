/**
 * Field Validation Service
 *
 * Service for validating fields against Jira field metadata
 */

import { validateSingleField } from './validators/fieldValidator'
import type { CategorizedFields } from '../../../jira/api/getAndCategorizeFields'

/**
 * Validates fields against their metadata
 */
export function validateFieldsWithMetadata(
	fields: Record<string, unknown>,
	fieldMetadata: CategorizedFields,
): { isValid: boolean; errors: Record<string, string[]> } {
	const errors: Record<string, string[]> = {}

	// Process each field
	Object.entries(fields).forEach(([fieldId, fieldValue]) => {
		const fieldErrors = validateSingleField(fieldId, fieldValue, fieldMetadata)
		if (fieldErrors.length > 0) {
			errors[fieldId] = fieldErrors
		}
	})

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}
