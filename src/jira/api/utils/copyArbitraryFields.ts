/**
 * Utility function for Jira Issue Payload Formatting
 *
 * Copies fields from a source object to a target object, excluding a predefined
 * set of keys that are handled explicitly elsewhere (like summary, project, etc.).
 * This is used when building the create issue payload to include any custom or
 * non-standard fields provided in the input.
 */
import type { CreateIssueFields } from '../createIssue'

/**
 * Copies arbitrary fields from the source, excluding known handled fields.
 * @param sourceFields The source fields object.
 * @param targetFields The target fields object to copy into.
 */
export function copyArbitraryFields(sourceFields: CreateIssueFields, targetFields: CreateIssueFields): void {
	const handledKeys = ['summary', 'project', 'issuetype', 'description', 'reporter', 'assignee']
	for (const key in sourceFields) {
		if (!handledKeys.includes(key)) {
			if (Object.prototype.hasOwnProperty.call(sourceFields, key)) {
				targetFields[key] = sourceFields[key]
			}
		}
	}
}
