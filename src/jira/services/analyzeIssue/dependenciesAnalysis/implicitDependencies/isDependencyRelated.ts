/**
 * This file provides functionality to evaluate whether a mentioned issue key is related to a dependency.
 * It analyzes the surrounding context of an issue key mention to determine if dependency-related phrases
 * appear nearby, which would indicate the issue is likely a dependency rather than just a mention.
 * The contextual analysis uses predefined dependency phrases and performs proximity-based checks
 * to identify relationships. This helps filter out irrelevant issue mentions while capturing
 * implicit dependencies that haven't been formally linked in the issue tracking system.
 */

import { DEPENDENCY_PHRASES } from '../utils/patterns/dependencyPhrases'

/**
 * Determines if an issue key is mentioned in relation to a dependency phrase
 */
export function isDependencyRelated(text: string, issueKey: string): boolean {
	const keyPosition = text.indexOf(issueKey)

	if (keyPosition === -1) {
		return false
	}

	// Check for dependency phrases within reasonable proximity (100 chars)
	const contextStart = Math.max(0, keyPosition - 100)
	const contextEnd = Math.min(text.length, keyPosition + 100)
	const context = text.substring(contextStart, contextEnd)

	return DEPENDENCY_PHRASES.some((phrase) => context.includes(phrase))
}
