/**
 * This file provides functionality to extract plain text content from Jira issue descriptions.
 * It handles both traditional string-based descriptions and structured Atlassian Document Format
 * (ADF) descriptions, converting them to plain text suitable for dependency analysis. The file
 * implements a recursive traversal of ADF document nodes to extract text while preserving
 * semantic structure. This text extraction is fundamental for dependency analysis that relies
 * on natural language processing to identify implicit dependencies in issue descriptions.
 */

import { stripMarkup } from './stripMarkup'
import type { ADFDocument } from '../../../../../types/atlassianDocument.types'
import type { DescriptionContentNode, JiraIssue } from '../../../../../types/issue.types'

/**
 * Extracts plain text from a Jira issue description
 */
export function extractTextFromDescription(issue: JiraIssue): string {
	if (!issue?.fields?.description) {
		return ''
	}

	const description = issue.fields.description

	// Handle different Jira description formats
	if (typeof description === 'string') {
		return description
	}

	// Handle Atlassian Document Format (ADF)
	return extractTextFromADF(description as ADFDocument)
}

/**
 * Extracts text from Atlassian Document Format
 */
export function extractTextFromADF(document: ADFDocument): string {
	if (!document?.content || !Array.isArray(document.content)) {
		return ''
	}

	// Process each content node to extract text
	return document.content
		.map((node) => extractTextFromNode(node))
		.filter(Boolean)
		.join('\n')
}

/**
 * Extracts text from an ADF node
 */
export function extractTextFromNode(node: DescriptionContentNode): string {
	if (!node) {
		return ''
	}

	// Handle text nodes directly
	if (node.type === 'text' && node.text) {
		return stripMarkup(node.text)
	}

	// Recursively extract text from content array
	if (node.content && Array.isArray(node.content)) {
		return node.content
			.map((child: DescriptionContentNode) => extractTextFromNode(child))
			.filter(Boolean)
			.join(' ')
	}

	return ''
}
