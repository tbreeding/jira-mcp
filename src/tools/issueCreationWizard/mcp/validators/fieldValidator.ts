/**
 * Field Validator
 *
 * Validates individual fields against their metadata
 */

import { findFieldMetadata } from './metadataFinder'
import { validateFieldTypeAndFormat } from './typeValidator'
import type { CategorizedFields } from '../../../../jira/api/getAndCategorizeFields'
import type { CategorizedField } from '../../../../jira/types/fieldMetadata.types'

/**
 * Validates if a field value is required but missing
 */
function validateRequiredField(fieldMeta: CategorizedField, value: unknown): string[] {
	const errors: string[] = []
	if (fieldMeta.metadata && fieldMeta.metadata.required && (value === null || value === undefined || value === '')) {
		errors.push('This field is required')
	}
	return errors
}

/**
 * Validates a single field against its metadata
 */
export function validateSingleField(fieldId: string, value: unknown, fieldMetadata: CategorizedFields): string[] {
	const errors: string[] = []

	// Find field metadata
	const fieldMeta = findFieldMetadata(fieldId, fieldMetadata)
	if (!fieldMeta) {
		errors.push(`Unknown field: ${fieldId}`)
		return errors
	}

	// Check if field is required but missing
	const requiredErrors = validateRequiredField(fieldMeta, value)
	errors.push(...requiredErrors)

	// Validate based on field type if value is present
	if (value !== null && value !== undefined) {
		const typeErrors = validateFieldTypeAndFormat(value, fieldMeta)
		errors.push(...typeErrors)
	}

	return errors
}
