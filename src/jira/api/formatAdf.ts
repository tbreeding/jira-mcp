/**
 * Jira ADF Formatting Utilities
 *
 * Provides functions to format text into Atlassian Document Format (ADF).
 */
import type { ADFDocument } from '../types/atlassianDocument.types'

/**
 * Transforms plain text descriptions into Atlassian Document Format
 * @param text The plain text to transform
 * @returns An ADF document object
 */
export function convertToAdf(text: string): ADFDocument {
	return {
		content: [
			{
				content: [
					{
						text: text,
						type: 'text',
					},
				],
				type: 'paragraph',
			},
		],
		type: 'doc',
		version: 1,
	}
}

/**
 * Transforms plain text into Atlassian Document Format.
 * Returns undefined if the input is not a non-empty string.
 */
export function formatDescriptionForAdf(description: unknown): ADFDocument | undefined {
	if (typeof description === 'string' && description.length > 0) {
		return convertToAdf(description)
	}
	return undefined
}
