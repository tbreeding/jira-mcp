/**
 * Atlassian Document Format Type Definitions
 *
 * This module defines the TypeScript interfaces for working with Atlassian Document Format (ADF),
 * the rich text format used by Jira for issue descriptions, comments, and other text content.
 * The type definitions enable type-safe handling of the structured document format, ensuring
 * that operations on ADF content are performed correctly. These types are used throughout the
 * application to parse, process, and extract information from rich text fields in Jira issues.
 */
import type { DescriptionContentNode } from './issue.types'

/**
 * Represents an Atlassian Document Format (ADF) document
 */
export interface ADFDocument {
	version: number
	type: string
	content: DescriptionContentNode[]
}
