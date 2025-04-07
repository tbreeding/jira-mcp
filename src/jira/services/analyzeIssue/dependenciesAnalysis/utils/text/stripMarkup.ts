/**
 * Markup Stripping Utility for Dependency Analysis Text Processing
 *
 * This utility function removes Markdown and HTML syntax from text content in Jira issues,
 * allowing for cleaner text analysis when searching for dependencies and relationships.
 * By stripping formatting elements, it enables more accurate keyword matching and content
 * analysis while preventing false positives from markup syntax characters.
 */
export function stripMarkup(text: string): string {
	if (!text) {
		return ''
	}

	// Remove HTML tags
	let stripped = text.replace(/<[^>]+>/g, ' ')

	// Remove Markdown formatting
	stripped = stripped.replace(/[*_~`#]+/g, '')

	return stripped.trim()
}
