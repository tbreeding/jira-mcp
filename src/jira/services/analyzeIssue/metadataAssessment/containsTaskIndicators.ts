/**
 * Checks if text contains task-related keywords
 */
export function containsTaskIndicators(text: string): boolean {
	const taskKeywords = [
		'update',
		'change',
		'modify',
		'refactor',
		'improve',
		'optimize',
		'clean up',
		'organize',
		'rework',
		'adjustment',
	]
	return taskKeywords.some((keyword) => text.toLowerCase().includes(keyword))
}
