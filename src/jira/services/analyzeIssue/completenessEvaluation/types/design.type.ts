/**
 * Types related to design specification checks for completeness evaluation
 *
 * This file contains type definitions used in the design specification checking process.
 * These types represent Jira issue components and attachments.
 */

/**
 * Interface for attachment in JiraIssue
 */
export interface Attachment {
	filename: string
	[key: string]: unknown
}

/**
 * Interface for component in JiraIssue
 */
export interface Component {
	name: string
	[key: string]: unknown
}
