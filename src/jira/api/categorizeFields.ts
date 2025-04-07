/**
 * Field categorization functionality
 *
 * This file implements the logic to categorize Jira fields by their properties.
 */

import { determineFieldCategory } from './determineFieldCategory'
import type {
	FieldCategory,
	CategorizedField,
	JiraProjectFieldMetadata,
	JiraFieldMetadata,
} from '../types/fieldMetadata.types'

/**
 * Creates a categorized field from field data and category
 */
function createCategorizedField(id: string, field: JiraFieldMetadata, category: FieldCategory): CategorizedField {
	return {
		id,
		name: field.name,
		metadata: field,
		category,
	}
}

/**
 * Categorizes fields by their properties (required, system, custom, etc.)
 */
export function categorizeFields(projectMetadata: JiraProjectFieldMetadata): CategorizedField[] {
	if (!projectMetadata.issuetypes || projectMetadata.issuetypes.length === 0) {
		return []
	}

	const issueType = projectMetadata.issuetypes[0]
	const fields = issueType.fields
	const categorizedFields: CategorizedField[] = []

	for (const [id, field] of Object.entries(fields)) {
		const category = determineFieldCategory(field)
		const categorizedField = createCategorizedField(id, field, category)
		categorizedFields.push(categorizedField)
	}

	return categorizedFields
}
