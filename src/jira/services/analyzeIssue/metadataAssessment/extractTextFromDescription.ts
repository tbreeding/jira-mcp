/**
 * Description Text Extractor
 *
 * This utility extracts plain text content from structured Jira issue descriptions.
 * It handles both simple string descriptions and complex Atlassian Document Format (ADF)
 * structures, recursively traversing the content tree to extract meaningful text.
 * The module provides a reliable way to access description content regardless of its
 * format, ensuring consistent text processing for analysis, keyword extraction, and
 * metadata evaluations that depend on understanding the descriptive content of issues.
 */
import type { DescriptionContentNode, IssueDescription } from '../../../types/issue.types'

/**
 * Extracts text content from a Jira description object
 */
export function extractTextFromDescription(description: IssueDescription | string | null): string {
	if (!description) return ''
	if (typeof description === 'string') return description
	if (!description.content) return ''

	// Recursively extract text from the Jira description object
	function extractText(content: DescriptionContentNode | DescriptionContentNode[]): string {
		if (!content) return ''

		if (Array.isArray(content)) {
			return content.map(extractText).join(' ')
		}

		if (content.text) {
			return content.text
		}

		if (content.content) {
			return extractText(content.content)
		}

		return ''
	}

	return extractText(description.content)
}
