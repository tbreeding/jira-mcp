/**
 * Metadata Finder
 *
 * Utility functions for finding field metadata
 */

import type { CategorizedFields } from '../../../../jira/api/getAndCategorizeFields'
import type { CategorizedField } from '../../../../jira/types/fieldMetadata.types'

/**
 * Finds field metadata for a given field ID
 */
export function findFieldMetadata(fieldId: string, fieldMetadata: CategorizedFields): CategorizedField | null {
	// Look in each category of fields
	for (const category of Object.values(fieldMetadata)) {
		const field = category.find((f: CategorizedField) => {
			return f.id === fieldId
		})
		if (field) {
			return field
		}
	}
	return null
}
