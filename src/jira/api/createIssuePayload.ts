/**
 * Jira Issue Payload Formatting Utilities
 *
 * This module provides the primary function `buildCreateIssuePayload` to transform
 * raw issue data into the format required by the Jira REST API v3 for creating issues.
 * It utilizes helper functions for field transformation and ADF conversion.
 */

import { log } from '../../utils/logger'
import { formatDescriptionForAdf as defaultFormatAdf } from './formatAdf'
import { formatUserField as defaultFormatUser } from './formatUserField'
import { transformFieldsForPayload } from './utils/transformFieldsForPayload'
import type { CreateIssueFields } from './createIssue'
import type { ADFDocument } from '../types/atlassianDocument.types'

interface CreateIssueRequest extends Record<string, unknown> {
	fields: CreateIssueFields
	update: Record<string, unknown>
}

export function buildCreateIssuePayload(
	fields: CreateIssueFields,
	logger: typeof log = log,
	formatDescFn: (text: unknown) => ADFDocument | undefined = defaultFormatAdf,
	formatUserFn: typeof defaultFormatUser = defaultFormatUser,
): CreateIssueRequest {
	return {
		fields: transformFieldsForPayload(fields, logger, formatDescFn, formatUserFn),
		update: {},
	}
}
