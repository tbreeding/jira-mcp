/**
 * Utility functions for processing Atlassian Document Format (ADF) content
 */

/**
 * Processes a block in ADF content and extracts text
 *
 * @param block - An ADF content block
 * @returns Extracted text from the block
 */
export function processAdfBlock(block: Record<string, unknown>): string {
	if (Array.isArray(block?.content)) {
		return (block.content as Array<Record<string, unknown>>).map(extractTextFromItem).join(' ')
	}
	return ''
}

/**
 * Extracts text from an individual ADF content item
 *
 * @param item - An ADF content item
 * @returns The extracted text value
 */
export function extractTextFromItem(item: Record<string, unknown>): string {
	// Explicitly convert primitive values to strings, including false values
	const textValue = item?.text
	return textValue !== undefined && textValue !== null ? String(textValue) : ''
}
