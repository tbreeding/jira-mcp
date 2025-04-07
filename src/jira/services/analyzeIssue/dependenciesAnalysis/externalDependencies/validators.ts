/**
 * Determines if a word is valid for dependency extraction
 */
export function isValidDependencyWord(word: string): boolean {
	if (!word) {
		return false
	}

	const invalidWords = ['is', 'the', 'a', 'an', 'and', 'or', 'for', 'to', 'with', 'by']
	return !invalidWords.includes(word) && word.length > 2
}
