/**
 * Field Processor Utilities
 *
 * Utility functions for processing fields in the Jira Issue Creation Wizard.
 */

import { WizardStep } from '../types'
import { createProcessSuccessResult, createProcessErrorResult } from './utils'
import type { ProcessResult } from './utils'
import type { CategorizedFields } from '../../../jira/api/getAndCategorizeFields'
import type { CategorizedField } from '../../../jira/types/fieldMetadata.types'
import type { StateManager } from '../stateManager'

/**
 * Converts an array of CategorizedField to CategorizedFields (grouped by category)
 */
export function convertToCategorizedFields(fields: CategorizedField[]): CategorizedFields {
	const result: CategorizedFields = {}

	fields.forEach((field) => {
		const category = field.category.toString()
		if (!result[category]) {
			result[category] = []
		}
		result[category].push(field)
	})

	return result
}

/**
 * Interface for validation result
 */
interface ValidationResult {
	isValid: boolean
	errors: Record<string, string[]>
}

/**
 * Creates a validation response
 */
export function createValidationResponse(validationResult: ValidationResult): ProcessResult {
	return createProcessSuccessResult({
		success: true,
		message:
			Object.keys(validationResult.errors).length > 0
				? 'Validation failed for one or more fields'
				: 'All fields validated successfully',
		isValid: validationResult.isValid,
		errors: validationResult.errors,
	})
}

/**
 * Updates the wizard state with validated fields
 */
export function updateWizardWithFields(
	stateManager: StateManager,
	state: Record<string, unknown>,
	fields: Record<string, unknown>,
): ProcessResult {
	const updateResult = stateManager.updateState({
		fields: {
			...(state.fields as Record<string, unknown>),
			...fields,
		},
		currentStep: WizardStep.FIELD_COMPLETION,
	})

	if (!updateResult.success) {
		return createProcessErrorResult(`Failed to update state: ${updateResult.error.message}`)
	}

	// Return success result
	return createProcessSuccessResult({
		success: true,
		message: 'Fields updated successfully',
		updatedFields: Object.keys(fields),
	})
}
