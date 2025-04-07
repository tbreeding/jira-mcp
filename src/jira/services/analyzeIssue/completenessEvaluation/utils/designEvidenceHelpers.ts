/**
 * Design evidence utility functions
 *
 * This file contains helper functions for evaluating the presence and quality
 * of design evidence in Jira issues, including pattern matching and classification.
 */

/**
 * Checks if the issue text mentions design-related terms
 */
export function hasDesignMentions(text: string): boolean {
	const designPatterns = [
		/design (spec|specification)/i,
		/mockup/i,
		/wireframe/i,
		/UI (spec|specification)/i,
		/UX (spec|specification)/i,
		/design system/i,
		/prototype/i,
		/figma/i,
		/sketch/i,
	]

	return designPatterns.some(function (pattern) {
		return pattern.test(text)
	})
}

/**
 * Checks if the issue text contains links to design tools
 */
export function checkDesignLinks(text: string): boolean {
	const designLinkPatterns = [/figma\.com/i, /sketch\.cloud/i, /zeplin\.io/i, /invision/i, /abstract\.com/i]

	return designLinkPatterns.some(function (pattern) {
		return pattern.test(text)
	})
}

/**
 * Checks if there are multiple types of design evidence
 */
export function hasMultipleDesignEvidenceTypes(
	hasMentions: boolean,
	hasAttachments: boolean,
	hasLinks: boolean,
): boolean {
	return (hasMentions && hasAttachments) || (hasMentions && hasLinks) || (hasAttachments && hasLinks)
}

/**
 * Determines quality of design documentation based on evidence
 */
export function determineDesignQuality(
	hasMentions: boolean,
	hasAttachments: boolean,
	hasLinks: boolean,
): 'absent' | 'partial' | 'complete' {
	if (!hasMentions && !hasAttachments && !hasLinks) {
		return 'absent'
	}

	if (hasMultipleDesignEvidenceTypes(hasMentions, hasAttachments, hasLinks)) {
		return 'complete'
	}

	return 'partial'
}
