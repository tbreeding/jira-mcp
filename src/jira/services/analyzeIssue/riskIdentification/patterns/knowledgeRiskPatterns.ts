/**
 * Pattern constants for knowledge risk analysis
 *
 * This file contains patterns used to identify knowledge-related risks
 * in Jira issues, such as knowledge concentration and specialized technologies.
 */

/**
 * Knowledge concentration related patterns
 */
export const KNOWLEDGE_PATTERNS = [
	'only',
	'single',
	'sole',
	'domain knowledge',
	'expertise',
	'specialized',
	'expert',
	'senior',
	'experience',
	'skill',
	'familiarity',
	'nobody else',
	'tribal knowledge',
]

/**
 * Specialized technology related patterns
 */
export const SPECIALIZED_TECH_PATTERNS = [
	'complex',
	'complicated',
	'specialized',
	'proprietary',
	'custom',
	'unique',
	'unfamiliar',
	'new technology',
	'legacy',
	'rarely used',
	'outdated',
]
