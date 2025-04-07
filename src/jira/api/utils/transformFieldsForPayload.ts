/**
 * Utility function for Jira Issue Payload Formatting
 *
 * Transforms the core fields (summary, project, issuetype) and handles the
 * formatting of description, reporter, and assignee fields using provided
 * formatter functions. It relies on `copyArbitraryFields` to handle any
 * other non-standard fields.
 */
import { copyArbitraryFields } from './copyArbitraryFields'
import type { log } from '../../../utils/logger'
import type { ADFDocument } from '../../types/atlassianDocument.types'
import type { CreateIssueFields } from '../createIssue'
import type { formatUserField as FormatUserFnType } from '../formatUserField' // Import type only for function signature

/**
 * Transforms fields from wizard format to Jira API format using injected formatters.
 * @param fields The fields from wizard state
 * @param logger The logger function
 * @param formatDescFn The function to format description to ADF
 * @param formatUserFn The function to format user fields
 * @returns Transformed fields ready for API submission
 */
export function transformFieldsForPayload(
	fields: CreateIssueFields,
	logger: typeof log,
	formatDescFn: (text: unknown) => ADFDocument | undefined,
	formatUserFn: typeof FormatUserFnType,
): CreateIssueFields {
	const result: CreateIssueFields = {
		summary: fields.summary,
		project: fields.project,
		issuetype: fields.issuetype,
	}

	// Copy other arbitrary fields FIRST to avoid overwriting formatted fields
	copyArbitraryFields(fields, result)

	// Handle description using injected function
	const formattedDescription = formatDescFn(fields.description)
	if (formattedDescription) {
		result.description = formattedDescription
	}

	// Handle reporter using injected function
	const formattedReporter = formatUserFn(fields.reporter, 'Reporter', logger)
	if (formattedReporter) {
		result.reporter = formattedReporter
	} else {
		// Ensure raw reporter field copied by copyArbitraryFields is removed if invalid
		delete result.reporter
	}

	// Handle assignee using injected function
	const formattedAssignee = formatUserFn(fields.assignee, 'Assignee', logger)
	if (formattedAssignee) {
		result.assignee = formattedAssignee
	} else {
		// Ensure raw assignee field copied by copyArbitraryFields is removed if invalid
		delete result.assignee
	}

	return result
}
