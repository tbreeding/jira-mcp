/**
 * Field category determination for Jira API
 *
 * This file contains logic for categorizing Jira fields based on their properties.
 * The determineFieldCategory function analyzes field metadata and assigns appropriate
 * categories (Required, System, Custom, or Optional) to help with field organization
 * and prioritization in the UI. This categorization is essential for properly displaying
 * and handling different types of fields when working with Jira issues.
 */

import { FieldCategory } from '../types/fieldMetadata.types'
import type { JiraFieldMetadata } from '../types/fieldMetadata.types'

/**
 * Determines the category of a field based on its properties
 */
export function determineFieldCategory(field: JiraFieldMetadata): FieldCategory {
	if (field.required) {
		return FieldCategory.REQUIRED
	}

	if (field.schema.system) {
		return FieldCategory.SYSTEM
	}

	if (field.custom) {
		return FieldCategory.CUSTOM
	}

	return FieldCategory.OPTIONAL
}
