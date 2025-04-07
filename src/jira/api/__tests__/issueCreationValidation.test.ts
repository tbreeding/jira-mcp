/**
 * Unit tests for the issue creation validation functions
 */

import { describe, expect, it } from '@jest/globals'
import { validateCreateIssueFields } from '../issueCreationValidation'
import type { CreateIssueFields } from '../createIssue'

describe('validateCreateIssueFields', () => {
	it('should return null for valid fields', () => {
		// Valid fields with all required properties
		const validFields: CreateIssueFields = {
			summary: 'Test Issue',
			project: {
				key: 'TEST',
			},
			issuetype: {
				id: '10001',
			},
		}

		// Execute validation
		const result = validateCreateIssueFields(validFields)

		// Verify
		expect(result).toBeNull()
	})

	it('should return error for missing summary', () => {
		// Missing summary
		const invalidFields: CreateIssueFields = {
			summary: '',
			project: {
				key: 'TEST',
			},
			issuetype: {
				id: '10001',
			},
		}

		// Execute validation
		const result = validateCreateIssueFields(invalidFields)

		// Verify
		expect(result).toBe('Summary is required')
	})

	it('should return error for missing project key', () => {
		// Missing project key
		const invalidFields: CreateIssueFields = {
			summary: 'Test Issue',
			project: {
				key: '',
			},
			issuetype: {
				id: '10001',
			},
		}

		// Execute validation
		const result = validateCreateIssueFields(invalidFields)

		// Verify
		expect(result).toBe('Project key is required')
	})

	it('should return error for missing issue type ID', () => {
		// Missing issue type ID
		const invalidFields: CreateIssueFields = {
			summary: 'Test Issue',
			project: {
				key: 'TEST',
			},
			issuetype: {
				id: '',
			},
		}

		// Execute validation
		const result = validateCreateIssueFields(invalidFields)

		// Verify
		expect(result).toBe('Either issue type ID or name is required')
	})

	it('should return error for undefined project', () => {
		// Undefined project
		const invalidFields = {
			summary: 'Test Issue',
			issuetype: {
				id: '10001',
			},
		} as CreateIssueFields

		// Execute validation
		const result = validateCreateIssueFields(invalidFields)

		// Verify
		expect(result).toBe('Project key is required')
	})

	it('should return error for undefined issue type', () => {
		// Undefined issue type
		const invalidFields = {
			summary: 'Test Issue',
			project: {
				key: 'TEST',
			},
		} as CreateIssueFields

		// Execute validation
		const result = validateCreateIssueFields(invalidFields)

		// Verify
		expect(result).toBe('Issue type is required')
	})
})
