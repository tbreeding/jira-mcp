/**
 * This file provides functionality to transform Jira issue links into standardized LinkedIssue objects.
 * It serves as a unified mapper that handles both inward and outward links by delegating to specialized
 * extractors based on the link direction. The mapper also includes fallback mechanisms for incomplete
 * or invalid link data, ensuring that the dependency analysis can proceed even with imperfect data.
 * This approach centralizes the link mapping logic and provides a consistent interface for all link types.
 */

import { createLinkedIssue } from './createLinkedIssue'
import { extractFromInwardIssue } from './extractFromInwardIssue'
import { extractFromOutwardIssue } from './extractFromOutwardIssue'
import type { IssueLink } from '../../../../../types/issue.types'
import type { LinkedIssue } from '../../types/dependencies.types'

/**
 * Creates a fallback LinkedIssue when data is incomplete
 */
function createFallbackLinkedIssue(): LinkedIssue {
	return createLinkedIssue('unknown', 'No data available')
}

/**
 * Maps an issue link to a LinkedIssue object based on direction
 */
export function mapLinkToLinkedIssue(link: IssueLink): LinkedIssue {
	if (!link) {
		return createFallbackLinkedIssue()
	}

	const inwardResult = extractFromInwardIssue(link)
	if (inwardResult) {
		return inwardResult
	}

	const outwardResult = extractFromOutwardIssue(link)
	if (outwardResult) {
		return outwardResult
	}

	return createFallbackLinkedIssue()
}
