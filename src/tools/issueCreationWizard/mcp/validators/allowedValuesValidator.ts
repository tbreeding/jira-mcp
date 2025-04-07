/**
 * Allowed Values Validator
 *
 * Validates field values against their allowed values
 */

import { validateArrayValues } from './allowedValuesValidators/arrayValidator'
import { validateObjectWithId } from './allowedValuesValidators/objectValidator'
import { validatePrimitiveValue } from './allowedValuesValidators/primitiveValidator'
import type { CategorizedField } from '../../../../jira/types/fieldMetadata.types'

/**
 * Checks if validation should be skipped
 */
function shouldSkipValidation(value: unknown, fieldMeta: CategorizedField): boolean {
	return (
		!fieldMeta.metadata?.allowedValues ||
		fieldMeta.metadata.allowedValues.length === 0 ||
		value === null ||
		value === undefined
	)
}

/**
 * Validates a field value against allowed values in the field metadata
 */
export function validateAllowedValues(value: unknown, fieldMeta: CategorizedField): string[] {
	const errors: string[] = []

	// Skip validation if there are no allowed values or value is null/undefined
	if (shouldSkipValidation(value, fieldMeta)) {
		return errors
	}

	// Type assertion to ensure allowedValues is an array
	// this acceptable because we check for null/undefined in shouldSkipValidation
	const allowedValues = fieldMeta.metadata.allowedValues as unknown[]

	// Handle different value types
	if (Array.isArray(value)) {
		// Array values (like multi-select or labels)
		const arrayErrors = validateArrayValues(value, allowedValues)
		errors.push(...arrayErrors)
	} else if (typeof value === 'object' && value !== null) {
		// Object values (like select with ID or user)
		const objectErrors = validateObjectWithId(value, allowedValues)
		errors.push(...objectErrors)
	} else {
		// Primitive values (string, number, boolean)
		const primitiveErrors = validatePrimitiveValue(value, allowedValues)
		errors.push(...primitiveErrors)
	}

	return errors
}
