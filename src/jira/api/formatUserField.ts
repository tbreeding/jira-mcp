/**
 * Jira User Field Formatting Utilities
 *
 * Provides functions to format user-related fields (like reporter, assignee)
 * for the Jira API, handling different input types and validation.
 */

import { formatUserFieldFromString, formatUserFieldFromObject } from './utils/userFieldUtils'
import type { log } from '../../utils/logger'

export function formatUserField(
	userField: unknown,
	fieldName: string,
	logger: typeof log,
): { id: string } | object | undefined {
	if (userField === null || userField === undefined) {
		return undefined
	}

	if (typeof userField === 'string') {
		return formatUserFieldFromString(userField)
	}

	if (typeof userField === 'object') {
		// The null check within formatUserFieldFromObject handles potential nulls
		return formatUserFieldFromObject(userField, fieldName, logger)
	}

	logger(`WARN: ${fieldName} field has unexpected type: ${typeof userField}`)
	return undefined
}
