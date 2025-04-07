/**
 * Dependency risk patterns
 *
 * This file contains patterns used for identifying dependency-related risks
 * in Jira issues. These patterns help detect dependencies, blockers,
 * and external team dependencies.
 */

/**
 * Patterns to identify general dependencies
 */
export const DEPENDENCY_PATTERNS = [
	'dependency',
	'depends on',
	'waiting for',
	'blocked by',
	'reliant on',
	'prerequisite',
	'blocker',
	'blocking',
]

/**
 * Patterns to identify external dependencies
 */
export const EXTERNAL_DEPENDENCY_PATTERNS = [
	'external team',
	'third party',
	'vendor',
	'external dependency',
	'external service',
	'API integration',
	'other team',
]
