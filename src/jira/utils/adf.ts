/**
 * Atlassian Document Format (ADF) Utility Functions
 *
 * This module provides utility functions for working with Atlassian Document Format,
 * which is the structured format required for rich text fields in Jira like descriptions
 * and comments. These utilities handle conversion between plain text and ADF format.
 */

import type { ADFDocument } from '../types/atlassianDocument.types'

/**
 * Converts a plain text string to an Atlassian Document Format (ADF) document
 *
 * @param text The plain text to convert to ADF
 * @returns An ADF document object
 */
export function convertToADF(text: string): ADFDocument {
	// Split the text by new lines to create separate paragraphs
	const paragraphs = text.split(/\n\r?|\r\n?/).filter(Boolean)

	return {
		version: 1,
		type: 'doc',
		content:
			paragraphs.length > 0
				? paragraphs.map((paragraph) => ({
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: paragraph,
							},
						],
					}))
				: [
						{
							type: 'paragraph',
							content: [
								{
									type: 'text',
									text: text || '',
								},
							],
						},
					],
	}
}
