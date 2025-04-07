/**
 * Bug Indicator Detection Utility for Metadata Assessment
 *
 * This utility function analyzes text content to identify potential bug-related keywords
 * and phrases. It helps determine if an issue that may not be formally categorized as a bug
 * actually contains language suggesting it's related to a defect or problem. This detection
 * is used in metadata assessment to evaluate if issue types accurately reflect their content.
 */
export function containsBugIndicators(text: string): boolean {
	const bugKeywords = [
		'bug',
		'fix',
		'issue',
		'problem',
		'error',
		'crash',
		'defect',
		'broken',
		'incorrect',
		'not working',
		'failing',
		'exception',
	]
	return bugKeywords.some((keyword) => text.toLowerCase().includes(keyword))
}
