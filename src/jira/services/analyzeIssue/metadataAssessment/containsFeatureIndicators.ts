/**
 * Checks if text contains feature-related keywords
 */
export function containsFeatureIndicators(text: string): boolean {
	const featureKeywords = [
		'feature',
		'enhancement',
		'implement',
		'add',
		'new',
		'create',
		'user story',
		'as a user',
		'should be able to',
	]
	return featureKeywords.some((keyword) => text.toLowerCase().includes(keyword))
}
