/**
 * Extracts text from a comment body which can have different structures
 *
 * @param body - The comment body which could be a string or a complex structure
 * @returns The extracted text
 */
import { processAdfBlock } from './adfUtils'

export function getCommentText(body: Record<string, unknown>): string {
	// If body is a string, return it directly
	if (typeof body === 'string') {
		return body
	}

	// If body has Atlassian Document Format structure
	if (body && body.content && Array.isArray(body.content)) {
		return extractTextFromADF(body.content)
	}

	// Default fallback
	return ''
}

/**
 * Extracts text from Atlassian Document Format content
 *
 * @param content - ADF content array
 * @returns Extracted text
 */
function extractTextFromADF(content: Array<Record<string, unknown>>): string {
	return content.map(processAdfBlock).join(' ').trim()
}
