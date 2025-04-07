/**
 * Field Metadata types for Jira
 *
 * This file defines the interfaces for Jira field metadata
 * which is used to dynamically render the issue creation form.
 */

/**
 * Represents a field's schema information
 * Used internally within JiraFieldMetadata
 */
interface JiraFieldSchema {
	/** The type of the field (e.g., string, number, array) */
	type: string
	/** For custom fields, custom type information */
	custom?: string
	/** For items in array fields, the item type */
	items?: string
	/** System field identifier */
	system?: string
}

/**
 * Represents field metadata for a single field
 * Used internally within JiraIssueTypeFieldMetadata
 */
export interface JiraFieldMetadata {
	/** Field identifier */
	id: string
	/** Field name */
	name: string
	/** Whether the field is required */
	required: boolean
	/** Field schema information */
	schema: JiraFieldSchema
	/** Field operations (allowed actions) */
	operations?: string[]
	/** Default value for the field, if any */
	defaultValue?: unknown
	/** Whether the field is a custom field */
	custom?: boolean
	/** For fields with predefined values, the allowed values */
	allowedValues?: unknown[]
	/** Whether the field has a configured default value */
	hasDefaultValue?: boolean
}

/**
 * Represents the project field configuration including issue types
 */
export interface JiraProjectFieldMetadata {
	/** Project identifier */
	id: string
	/** Project key */
	key: string
	/** Project name */
	name: string
	/** Available issue types with field metadata */
	issuetypes: JiraIssueTypeFieldMetadata[]
}

/**
 * Represents an issue type with its field metadata
 * Used internally within JiraProjectFieldMetadata
 */
interface JiraIssueTypeFieldMetadata {
	/** Issue type identifier */
	id: string
	/** Issue type name */
	name: string
	/** Issue type description */
	description?: string
	/** Issue type icon URL */
	iconUrl?: string
	/** Issue type avatar identifier */
	avatarId?: number
	/** Whether the issue type is subtask type */
	subtask: boolean
	/** Metadata for fields available for this issue type */
	fields: Record<string, JiraFieldMetadata>
}

/**
 * Represents the top-level response from the create metadata API
 */
export interface JiraFieldMetadataResponse {
	/** Project configurations with field metadata */
	projects: JiraProjectFieldMetadata[]
}

/**
 * Field category for easier UI organization
 */
export enum FieldCategory {
	REQUIRED = 'required',
	RECOMMENDED = 'recommended',
	OPTIONAL = 'optional',
	SYSTEM = 'system',
	CUSTOM = 'custom',
}

/**
 * Categorized field for the wizard
 */
export interface CategorizedField {
	/** Field identifier */
	id: string
	/** Field name */
	name: string
	/** Original field metadata */
	metadata: JiraFieldMetadata
	/** Field category */
	category: FieldCategory
}
