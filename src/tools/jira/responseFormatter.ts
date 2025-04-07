/**
 * Jira Response Formatter
 *
 * This module contains utility functions for formatting Jira API responses
 * into standardized tool result formats, including pagination metadata.
 */

import { log } from '../../utils/logger'
import type { ToolResult } from '../../types'

interface PaginatedSearchResponse {
	issues: unknown[]
	total: number
	startAt: number
	maxResults: number
}

/**
 * Format a Jira search response with pagination metadata
 * @param searchResponse The search response from the Jira API
 * @param essentialIssues The processed/mapped issues
 * @returns Formatted tool result with pagination metadata
 */
export function formatSearchResponseWithPagination(
	searchResponse: PaginatedSearchResponse,
	essentialIssues: unknown[],
): ToolResult {
	const { total, startAt: responseStartAt, maxResults: responseMaxResults, issues } = searchResponse

	// Calculate pagination helpers
	const hasNextPage = responseStartAt + issues.length < total
	const hasPreviousPage = responseStartAt > 0
	const nextPageStartAt = hasNextPage ? responseStartAt + responseMaxResults : null
	const previousPageStartAt = hasPreviousPage ? Math.max(0, responseStartAt - responseMaxResults) : null

	// Log success
	log(`DEBUG: Found ${issues.length} issues out of ${total} total matches`)

	// Return the success response with enhanced pagination metadata
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify({
					success: true,
					data: essentialIssues,
					pagination: {
						startAt: responseStartAt,
						maxResults: responseMaxResults,
						total,
						currentPage: Math.floor(responseStartAt / responseMaxResults) + 1,
						totalPages: Math.ceil(total / responseMaxResults),
						hasNextPage,
						hasPreviousPage,
						nextPageStartAt,
						previousPageStartAt,
					},
				}),
			},
		],
	}
}
