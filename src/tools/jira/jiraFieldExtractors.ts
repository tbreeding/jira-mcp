/**
 * Jira Field Extractor Utilities
 *
 * This file contains utility functions for extracting and transforming
 * data from Jira fields in a type-safe way.
 */

/**
 * Sprint object structure from Jira
 */
interface JiraSprint {
	name: string
	id: number
	state?: string
	boardId?: number
}

/**
 * Extract sprint names from a Jira issue's fields
 */
export function extractSprints(fields: Record<string, unknown>): string[] {
	// Extract from customfield_10600 which contains sprint information
	if (Array.isArray(fields.customfield_10600)) {
		return fields.customfield_10600
			.filter((s): s is JiraSprint => s && typeof s === 'object' && 'name' in s)
			.map((s) => s.name)
	}
	return []
}

/**
 * Extract a named string property from a Jira object field
 */
export function getNamedProperty(obj: unknown, propName: string): string {
	if (obj && typeof obj === 'object' && propName in (obj as object)) {
		return ((obj as Record<string, unknown>)[propName] as string) || ''
	}
	return ''
}

/**
 * Extract parent information from a Jira issue
 */
export function extractParent(fields: Record<string, unknown>): { key: string; summary: string } | undefined {
	if (!fields.parent || typeof fields.parent !== 'object') {
		return undefined
	}
	const parent = fields.parent as Record<string, unknown>
	const parentFields = parent.fields as Record<string, unknown>
	return {
		key: (parent.key as string) || '',
		summary: (parentFields?.summary as string) || '',
	}
}
