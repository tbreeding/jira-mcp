/**
 * Feedback Response Time Types Module for Continuity Analysis
 *
 * This module defines the type interfaces used in the feedback response time analysis
 * system. It includes data structures for representing comments, their timestamps,
 * content, and authorship information, which are essential for tracking communication
 * patterns and measuring responsiveness within Jira issues.
 */
import type { ADFDocument } from '../../../../types/atlassianDocument.types'

export interface JiraComment {
	created: string
	body?: {
		content: ADFDocument[]
	}
	author?: {
		displayName?: string
	}
}
