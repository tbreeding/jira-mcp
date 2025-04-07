/**
 * Determines if a field is considered "significant" for late changes
 *
 * @param fieldName - The field name
 * @returns Whether the field is significant for late changes
 */
export function isSignificantField(fieldName: string): boolean {
	const significantFields = [
		'description',
		'summary',
		'issuetype',
		'priority',
		'customfield_10010', // Story points (assuming this is the field, adjust as needed)
		'customfield_10000', // Epic link (assuming this is the field, adjust as needed)
		'labels',
		'fixVersions',
		'components',
		'assignee',
	]

	return significantFields.includes(fieldName)
}
