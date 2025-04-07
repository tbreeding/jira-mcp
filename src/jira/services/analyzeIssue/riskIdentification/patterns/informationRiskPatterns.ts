/**
 * Pattern constants for information risk analysis
 *
 * This file contains patterns used to identify information-related risks
 * in Jira issues, such as missing requirements and ambiguities.
 */

/**
 * Requirements gap related patterns
 */
export const REQUIREMENTS_PATTERNS = [
	'missing',
	'unclear',
	'vague',
	'ambiguous',
	'not specified',
	'incomplete',
	'lacking',
	'undefined',
	'need clarification',
	'not defined',
	'tbd',
	'to be determined',
	'?',
	'needs more detail',
]

/**
 * Ambiguity related patterns
 */
export const AMBIGUITY_PATTERNS = [
	'ambiguous',
	'ambiguity',
	'unclear',
	'vague',
	'confusing',
	'confused',
	'unsure',
	'not sure',
	'possibly',
	'might be',
	'could be',
	'either',
	'or',
	'alternative',
	'assumption',
]
