/**
 * Jira Issue Payload Formatting Utilities
 *
 * This module provides the primary function `buildCreateIssuePayload` to transform
 * raw issue data into the format required by the Jira REST API v3 for creating issues.
 * It utilizes helper functions for field transformation and ADF conversion.
 */

import { log } from '../../utils/logger'
import { transformFieldsForPayload } from './utils/transformFieldsForPayload'
import type { CreateIssueFields } from './createIssue'

interface CreateIssueRequest extends Record<string, unknown> {
	fields: CreateIssueFields
	update: Record<string, unknown>
}

export function buildCreateIssuePayload(fields: CreateIssueFields, logger: typeof log = log): CreateIssueRequest {
	return {
		fields: transformFieldsForPayload(fields, logger),
		update: {},
	}
}
