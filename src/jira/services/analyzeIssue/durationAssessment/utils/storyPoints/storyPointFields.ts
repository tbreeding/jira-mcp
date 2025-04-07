/**
 * Story Point Field Configuration
 *
 * This module defines the standard and alternative custom field identifiers used for storing story
 * points across different Jira configurations. It provides a prioritized list of field names that
 * are commonly used by different organizations to track estimation values. This configuration
 * enables consistent story point extraction regardless of the specific Jira setup, supporting
 * reliable metrics calculation across diverse environments and team configurations.
 */
export const STORY_POINT_FIELD = 'customfield_10105'
export const OTHER_STORY_POINT_FIELDS = [
	'customfield_10002', // Common story point field
	'customfield_10004',
	'customfield_10006',
	'customfield_10007',
	'customfield_10106',
	'customfield_10300',
	'customfield_14735', // Found in the provided issue type
]
