/**
 * This file provides helper functions for working with Jira issue link relationships.
 * It includes utilities to extract relationship types, summary information, and other
 * metadata from issue links. These helper functions support the dependencies analysis
 * by providing consistent ways to access and normalize information from Jira's complex
 * issue link structure, which varies based on the direction of the relationship.
 */

import type { IssueLink } from '../../../../types/issue.types'

export function getRelationship(link: IssueLink): string {
	return link.type?.inward || 'blocks'
}

function getInwardSummary(link: IssueLink): string | undefined {
	return link.inwardIssue?.fields?.summary
}

function getOutwardSummary(link: IssueLink): string | undefined {
	return link.outwardIssue?.fields?.summary
}

export function getSummary(link: IssueLink): string {
	return getInwardSummary(link) || getOutwardSummary(link) || 'No summary available'
}
