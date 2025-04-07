/**
 * Risk detection patterns for technical risk analysis
 *
 * This file contains regex patterns and keywords for identifying
 * various types of technical risks in Jira issues.
 */

/**
 * Technical debt related keywords and patterns
 */
export const TECHNICAL_DEBT_PATTERNS = [
	'technical debt',
	'workaround',
	'hack',
	'temporary solution',
	'refactor',
	'rewrite',
	'quick fix',
	'bandaid',
	'cleanup',
	/fix\s+later/i,
	/todo\s+later/i,
]

/**
 * Architecture impact related keywords and patterns
 */
export const ARCHITECTURE_PATTERNS = [
	'architecture',
	'redesign',
	'refactor',
	'system-wide',
	'component',
	'architectural',
	'design pattern',
	'infrastructure',
	'foundational',
	'platform',
	'framework',
]

/**
 * Performance related keywords and patterns
 */
export const PERFORMANCE_PATTERNS = [
	'performance',
	'slow',
	'latency',
	'throughput',
	'optimization',
	'memory',
	'cpu',
	'bottleneck',
	'scalability',
	/time\s+complexity/i,
	/space\s+complexity/i,
]

/**
 * Security related keywords and patterns
 */
export const SECURITY_PATTERNS = [
	'security',
	'authentication',
	'authorization',
	'encryption',
	'vulnerability',
	'sensitive data',
	'compliance',
	'permission',
	'access control',
	'secure',
	'privacy',
]

// Export all patterns together instead of individually
