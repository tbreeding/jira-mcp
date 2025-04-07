/**
 * Design specifications evaluation functionality
 *
 * This file implements the logic for analyzing and evaluating the presence
 * and quality of design specifications within Jira issues. It detects patterns
 * indicative of proper design documentation for UI and UX requirements.
 */

import { hasDesignMentions, checkDesignLinks, determineDesignQuality } from './utils/designEvidenceHelpers'
import { isDesignRelatedFile } from './utils/isDesignRelatedFile'
import { isFrontendComponent } from './utils/isFrontendComponent'
import type { CategoryCheckResult } from './completenessEvaluation.types'
import type { Attachment, Component } from './types/design.type'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Checks if the issue has design-related file attachments
 */
function checkDesignAttachments(issue: JiraIssue): boolean {
	if (!issue.fields.attachment) {
		return false
	}

	return Boolean(
		(issue.fields.attachment as Attachment[]).some(function (attachment) {
			return isDesignRelatedFile(attachment.filename)
		}),
	)
}

/**
 * Checks if the issue is frontend/UI related based on components
 */
function isFrontendIssue(issue: JiraIssue): boolean {
	if (!issue.fields.components) {
		return false
	}

	return Boolean(
		(issue.fields.components as Component[]).some(function (component) {
			return isFrontendComponent(component.name)
		}),
	)
}

/**
 * Checks if design specifications are documented in a Jira issue
 */
export function checkDesignSpecifications(allText: string, issue: JiraIssue): CategoryCheckResult {
	const hasMentionedDesign = hasDesignMentions(allText)
	const hasDesignAttachments = checkDesignAttachments(issue)
	const hasDesignLinks = checkDesignLinks(allText)

	// Determine presence and quality
	const isPresent = hasMentionedDesign || hasDesignAttachments || hasDesignLinks
	const quality = determineDesignQuality(hasMentionedDesign, hasDesignAttachments, hasDesignLinks)

	// For non-UI issues, adjust the missing message
	const isFrontendRelated = isFrontendIssue(issue)
	const missingMessage = isFrontendRelated
		? 'Design specifications not provided'
		: 'Design specifications may be required if this involves UI changes'

	return {
		missing: isPresent ? [] : [missingMessage],
		present: isPresent,
		quality,
	}
}
