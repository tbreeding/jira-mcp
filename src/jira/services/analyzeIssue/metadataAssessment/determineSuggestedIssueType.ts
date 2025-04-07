/**
 * Suggests the appropriate issue type based on content indicators
 */
export function determineSuggestedIssueType(
	currentType: string,
	hasBugIndicators: boolean,
	hasFeatureIndicators: boolean,
	hasTaskIndicators: boolean,
): string {
	// If current type is valid for the content, keep it
	if (isTypeValidForContent(currentType, hasBugIndicators, hasFeatureIndicators, hasTaskIndicators)) {
		return currentType
	}

	// Handle misclassifications
	if (currentType === 'Bug') {
		return suggestTypeForMisclassifiedBug(hasFeatureIndicators)
	}

	if (currentType === 'Story') {
		return suggestTypeForMisclassifiedStory(hasBugIndicators, hasFeatureIndicators)
	}

	if (currentType === 'Task') {
		return suggestTypeForMisclassifiedTask(hasBugIndicators, hasFeatureIndicators, hasTaskIndicators)
	}

	// Default to keeping the current type if no better suggestion found
	return currentType
}

/**
 * Checks if the current issue type is valid for the content indicators
 */
function isTypeValidForContent(
	type: string,
	hasBugIndicators: boolean,
	hasFeatureIndicators: boolean,
	hasTaskIndicators: boolean,
): boolean {
	return (
		(type === 'Bug' && hasBugIndicators) ||
		(type === 'Story' && hasFeatureIndicators) ||
		(type === 'Task' && hasTaskIndicators)
	)
}

/**
 * Suggests a better type for a misclassified Bug issue
 */
function suggestTypeForMisclassifiedBug(hasFeatureIndicators: boolean): string {
	return hasFeatureIndicators ? 'Story' : 'Task'
}

/**
 * Suggests a better type for a misclassified Story issue
 */
function suggestTypeForMisclassifiedStory(hasBugIndicators: boolean, hasFeatureIndicators: boolean): string {
	return hasBugIndicators && !hasFeatureIndicators ? 'Bug' : 'Story'
}

/**
 * Suggests a better type for a misclassified Task issue
 */
function suggestTypeForMisclassifiedTask(
	hasBugIndicators: boolean,
	hasFeatureIndicators: boolean,
	hasTaskIndicators: boolean,
): string {
	if (hasBugIndicators && !hasTaskIndicators) return 'Bug'
	if (hasFeatureIndicators && !hasTaskIndicators) return 'Story'
	return 'Task'
}
