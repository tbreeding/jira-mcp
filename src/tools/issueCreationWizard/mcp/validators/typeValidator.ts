/**
 * Type Validator
 *
 * Validates field values against their expected types
 */

import { validateAllowedValues } from './allowedValuesValidator'
import type { CategorizedField } from '../../../../jira/types/fieldMetadata.types'

/**
 * Type for validator functions that validate field values
 */
type ValidatorFunction = (value: unknown, ...args: unknown[]) => string[]

/**
 * Validates string type values
 */
function validateString(value: unknown): string[] {
	const errors: string[] = []
	if (typeof value !== 'string') {
		errors.push('Value must be a string')
	}
	return errors
}

/**
 * Validates number type values
 */
function validateNumber(value: unknown, isInteger: boolean): string[] {
	const errors: string[] = []
	if (typeof value !== 'number' || (isInteger && !Number.isInteger(value))) {
		errors.push(`Value must be a${isInteger ? 'n integer' : ' number'}`)
	}
	return errors
}

/**
 * Validates array type values
 */
function validateArray(value: unknown): string[] {
	const errors: string[] = []
	if (!Array.isArray(value)) {
		errors.push('Value must be an array')
	}
	return errors
}

/**
 * Validates object type values (options, users, groups)
 */
function validateObject(value: unknown): string[] {
	const errors: string[] = []
	if (typeof value !== 'object' || value === null) {
		errors.push('Value must be a valid option object')
	}
	return errors
}

/**
 * Gets the validator function based on schema type
 */
function getValidatorForType(type: string): ValidatorFunction {
	const validators: Record<string, ValidatorFunction> = {
		string: validateString,
		number: (value: unknown): string[] => validateNumber(value, false),
		integer: (value: unknown): string[] => validateNumber(value, true),
		array: validateArray,
		option: validateObject,
		user: validateObject,
		group: validateObject,
	}

	return validators[type] || ((): string[] => [])
}

/**
 * Validates a field's value against its expected type and format
 */
export function validateFieldTypeAndFormat(value: unknown, fieldMeta: CategorizedField): string[] {
	if (!fieldMeta.metadata || !fieldMeta.metadata.schema) {
		return []
	}

	const errors: string[] = []

	// Validate type
	const schemaType = fieldMeta.metadata.schema.type
	const validator = getValidatorForType(schemaType)
	const typeErrors = validator(value)
	errors.push(...typeErrors)

	// If type validation passes, also validate against allowed values if applicable
	if (typeErrors.length === 0) {
		const allowedValueErrors = validateAllowedValues(value, fieldMeta)
		errors.push(...allowedValueErrors)
	}

	return errors
}
