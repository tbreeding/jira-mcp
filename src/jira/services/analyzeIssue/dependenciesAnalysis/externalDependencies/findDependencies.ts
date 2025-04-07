/**
 * External Dependencies Detector
 *
 * This module analyzes issue content to identify references to external dependencies
 * that aren't explicitly linked in Jira. It scans issue descriptions and comments for
 * patterns that suggest dependency relationships, such as references to other systems,
 * teams, or organizational entities. By detecting these implicit dependencies, the module
 * helps create a more complete picture of what might impact issue delivery timelines.
 */

import { extractDependencyName } from './extractionStrategies'

/**
 * Generic function to find dependencies based on indicator words
 */
export function findDependencies(text: string, indicators: string[]): string[] {
	if (!text || !indicators || indicators.length === 0) {
		return []
	}

	const dependencies = new Set<string>()
	const words = text.toLowerCase().split(/\s+/)

	// Process each word to find potential dependencies
	processWordsForDependencies(words, indicators, dependencies)

	return Array.from(dependencies)
}

/**
 * Processes words to find dependencies based on indicators
 */
export function processWordsForDependencies(words: string[], indicators: string[], dependencies: Set<string>): void {
	for (let i = 0; i < words.length; i++) {
		const word = words[i]

		// Check if this word is an indicator
		if (indicators.includes(word)) {
			// Look for a potential dependency name in surrounding words
			const dependency = extractDependencyName(words, i)
			if (dependency) {
				dependencies.add(dependency)
			}
		}
	}
}
