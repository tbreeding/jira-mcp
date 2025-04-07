/**
 * Summary Validation Constants
 *
 * This module defines constants used in the validation of Jira issue summaries.
 * It includes lists of vague terms to avoid, action verbs to encourage, and
 * validation messages for different quality criteria. Centralizing these constants
 * improves maintainability and enables easy customization of validation rules.
 */

/**
 * List of terms that are considered too vague when used alone as a summary
 */
export const VAGUE_TERMS = ['issue', 'problem', 'bug', 'error', 'fix', 'update', 'implement']

/**
 * List of action verbs that indicate an actionable summary
 */
export const ACTION_VERBS = [
	'add',
	'create',
	'implement',
	'update',
	'modify',
	'fix',
	'remove',
	'enhance',
	'improve',
	'optimize',
	'refactor',
	'integrate',
	'start',
	'stop',
	'continue',
	'complete',
	'resolve',
	'close',
	'fix',
]

/**
 * Validation result messages for different quality criteria
 */
export const MESSAGES = {
	TOO_SHORT: 'Too short: Lacks sufficient detail',
	TOO_LONG: 'Too long: Consider being more concise',
	TOO_VAGUE: 'Too vague: Be more specific about what needs to be done',
	NOT_ACTIONABLE: 'Not actionable: Use clear verbs to describe what needs to be done',
	GOOD: 'Good: Clear, specific, and actionable',
}

/**
 * Minimum and maximum length thresholds for summaries
 */
export const LENGTH_THRESHOLDS = {
	MIN_SUMMARY_LENGTH: 10,
	MAX_SUMMARY_LENGTH: 100,
}
