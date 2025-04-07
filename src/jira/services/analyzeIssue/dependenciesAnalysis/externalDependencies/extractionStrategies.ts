/**
 * This file implements various strategies for extracting dependency information from text.
 * It uses a pattern-matching approach to identify external dependencies mentioned in Jira issues,
 * focusing on contextual patterns where dependencies might be mentioned. The file implements
 * multiple extraction strategies (checking words before, two words before, and words after an
 * indicator word) and combines them in a prioritized order to maximize the chances of correctly
 * identifying dependencies mentioned in natural language text.
 */

import { isValidDependencyWord } from './validators'

/**
 * Strategy pattern for extracting dependency names
 */
export function extractDependencyName(words: string[], indicatorIndex: number): string | null {
	// Try each extraction strategy in order
	return (
		checkWordsBefore(words, indicatorIndex) ||
		checkTwoWordsBefore(words, indicatorIndex) ||
		checkWordsAfter(words, indicatorIndex)
	)
}

/**
 * Checks for dependencies in words before the indicator
 */
export function checkWordsBefore(words: string[], indicatorIndex: number): string | null {
	if (indicatorIndex <= 0) {
		return null
	}

	const previousWord = words[indicatorIndex - 1]
	if (isValidDependencyWord(previousWord)) {
		return `${previousWord} ${words[indicatorIndex]}`
	}

	return null
}

/**
 * Checks for dependencies in two words before the indicator
 */
export function checkTwoWordsBefore(words: string[], indicatorIndex: number): string | null {
	if (indicatorIndex <= 1) {
		return null
	}

	const twoWordsBefore = `${words[indicatorIndex - 2]} ${words[indicatorIndex - 1]}`
	if (twoWordsBefore.length > 5) {
		return `${twoWordsBefore} ${words[indicatorIndex]}`
	}

	return null
}

/**
 * Checks for dependencies in words after the indicator
 */
export function checkWordsAfter(words: string[], indicatorIndex: number): string | null {
	if (indicatorIndex >= words.length - 1) {
		return null
	}

	const nextWord = words[indicatorIndex + 1]
	if (isValidDependencyWord(nextWord)) {
		return `${words[indicatorIndex]} ${nextWord}`
	}

	return null
}
