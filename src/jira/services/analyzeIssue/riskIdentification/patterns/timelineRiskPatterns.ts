/**
 * Pattern constants for timeline risk analysis
 *
 * This file contains patterns used to identify timeline-related risks
 * in Jira issues, such as tight deadlines and estimation concerns.
 */

/**
 * Timeline risk related patterns
 */
export const TIMELINE_PATTERNS = [
	'deadline',
	'time constraint',
	'urgent',
	'ASAP',
	'timeframe',
	'due date',
	'timeline',
	'schedule',
	'milestone',
	'late',
	'delay',
	'behind',
	/by\s+end\s+of/i,
]

/**
 * Estimation risk related patterns
 */
export const ESTIMATION_PATTERNS = [
	'estimation',
	'underestimated',
	'overestimated',
	'reestimate',
	'complexity',
	'challenging',
	'difficult',
	'harder than expected',
	'more complex than',
	'uncertain',
	'not clear how long',
]
