/**
 * User Field Utility Functions
 *
 * Pure utility functions for formatting user fields that can be tested independently.
 */

import type { log } from '../../../utils/logger'

/**
 * Formats a string user field into the expected Jira API format
 */
export function formatUserFieldFromString(userField: string): { id: string } | undefined {
	return userField.length > 0 ? { id: userField } : undefined
}

/**
 * Formats an object user field into the expected Jira API format
 */
export function formatUserFieldFromObject(
	userField: object | null,
	fieldName: string,
	logger: typeof log,
): object | undefined {
	if (userField === null) {
		logger(`WARN: ${fieldName} field received null unexpectedly in object check.`)
		return undefined
	}
	if ('id' in userField || 'accountId' in userField) {
		return userField // Keep existing valid object format
	}
	logger(`WARN: ${fieldName} field has unexpected object format: ${JSON.stringify(userField)}`)
	return undefined
}
