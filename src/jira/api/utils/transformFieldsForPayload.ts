/**
 * Utility function for Jira Issue Payload Formatting
 *
 * Transforms the core fields (summary, project, issuetype) and handles the
 * formatting of description, reporter, and assignee fields using provided
 * formatter functions. It relies on `copyArbitraryFields` to handle any
 * other non-standard fields.
 */
import { formatDescriptionForAdf } from '../formatAdf'
import { formatUserField } from '../formatUserField'
import type { log } from '../../../utils/logger'
import type { CreateIssueFields } from '../createIssue'

function shouldSkipField(_key: string, value: unknown): boolean {
	return value === null || value === undefined || value === ''
}

interface FieldHandler {
	transform: (key: string, value: unknown, logger: typeof log) => [string, unknown]
}

const defaultHandler: FieldHandler = {
	transform: (key, value) => [key, value],
}

const handlers: Record<string, FieldHandler> = {
	summary: defaultHandler,
	issuetype: defaultHandler,
	project: defaultHandler,
	description: {
		transform: (key, value) => {
			if (typeof value === 'string') return [key, formatDescriptionForAdf(value)]

			return [key, value]
		},
	},
	assignee: {
		transform: (key, value, logger) => [key, formatUserField(value, 'Assignee', logger)],
	},
	reporter: {
		transform: (key, value, logger) => [key, formatUserField(value, 'Reporter', logger)],
	},
}

// Overload signatures
export function transformFieldsForPayload(fields: CreateIssueFields, logger: typeof log): CreateIssueFields
export function transformFieldsForPayload(
	fields: Partial<CreateIssueFields>,
	logger: typeof log,
): Partial<CreateIssueFields>
// Implementation
export function transformFieldsForPayload(
	fields: Partial<CreateIssueFields>,
	logger: typeof log,
): Partial<CreateIssueFields> {
	return Object.entries(fields).reduce((result, [key, value]) => {
		if (shouldSkipField(key, value)) return result
		const handler = handlers[key] ?? defaultHandler
		const [k, v] = handler.transform(key, value, logger)
		result[k] = v
		return result
	}, {} as Partial<CreateIssueFields>)
}
