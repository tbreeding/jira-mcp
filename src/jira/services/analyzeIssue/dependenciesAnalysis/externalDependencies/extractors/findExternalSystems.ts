/**
 * This file provides functionality to identify external system dependencies mentioned in Jira issues.
 * It searches for references to systems, APIs, databases, and other technical infrastructure that
 * an issue may depend on. By detecting these external system dependencies, the analysis can highlight
 * potential integration points and technical dependencies that may affect issue resolution timeframes
 * or require coordination with other teams or services outside the immediate project scope.
 */

import { findDependencies } from '../findDependencies'
import { EXTERNAL_SYSTEM_INDICATORS } from '../indicators/systemIndicators'

/**
 * Finds external system dependencies in text
 */
export function findExternalSystems(text: string): string[] {
	return findDependencies(text, EXTERNAL_SYSTEM_INDICATORS)
}
