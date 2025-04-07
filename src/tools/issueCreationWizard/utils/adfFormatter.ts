/**
 * ADF Formatter for Issue Creation Wizard
 *
 * This utility handles converting simple text field values to Atlassian Document Format (ADF)
 * for compatible fields like description.
 */

import { convertToADF } from '../../../jira/utils/adf'
import type { WizardState } from '../types'

/**
 * Format field values from the wizard state to be compatible with Jira API
 * This converts text descriptions to ADF format
 *
 * @param state The current wizard state with fields
 * @returns A new fields object with properly formatted values
 */
export function formatFieldsForSubmission(state: WizardState): Record<string, unknown> {
	// Create a copy of the fields to avoid mutating the original state
	const formattedFields = { ...state.fields }

	// Convert description to ADF if it's a string
	if (typeof formattedFields.description === 'string') {
		formattedFields.description = convertToADF(formattedFields.description as string)
	}

	return formattedFields
}

/**
 * Check if a field value should be treated as ADF
 *
 * @param fieldId The ID of the field to check
 * @returns True if the field should be in ADF format
 */
export function isADFField(fieldId: string): boolean {
	// List of fields that require ADF format
	const adfFields = ['description', 'comment']
	return adfFields.includes(fieldId)
}

/**
 * Get a field value properly formatted for display in UI or for API submission
 *
 * @param fieldId The ID of the field
 * @param value The field value
 * @returns The formatted value
 */
export function getFormattedFieldValue(fieldId: string, value: unknown): unknown {
	// If it's already an ADF document, return as is
	if (value && typeof value === 'object' && (value as Record<string, unknown>).type === 'doc') {
		return value
	}

	// If this is an ADF field and the value is a string, convert it
	if (isADFField(fieldId) && typeof value === 'string') {
		return convertToADF(value)
	}

	// Otherwise return the value as is
	return value
}
