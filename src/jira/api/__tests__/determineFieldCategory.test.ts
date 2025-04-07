/**
 * Tests for field category determination utilities
 */

import { FieldCategory } from '../../types/fieldMetadata.types'
import { determineFieldCategory } from '../determineFieldCategory'
import type { JiraFieldMetadata } from '../../types/fieldMetadata.types'

describe('determineFieldCategory', () => {
	it('should categorize required fields as REQUIRED', () => {
		const field: JiraFieldMetadata = {
			id: 'summary',
			name: 'Summary',
			required: true,
			schema: { type: 'string' },
			custom: false,
		}

		const result = determineFieldCategory(field)

		expect(result).toBe(FieldCategory.REQUIRED)
	})

	it('should categorize system fields as SYSTEM when not required', () => {
		const field: JiraFieldMetadata = {
			id: 'issuetype',
			name: 'Issue Type',
			required: false,
			schema: { type: 'issuetype', system: 'issuetype' },
			custom: false,
		}

		const result = determineFieldCategory(field)

		expect(result).toBe(FieldCategory.SYSTEM)
	})

	it('should categorize custom fields as CUSTOM when not required or system', () => {
		const field: JiraFieldMetadata = {
			id: 'customfield_10001',
			name: 'Epic Link',
			required: false,
			schema: { type: 'any' },
			custom: true,
		}

		const result = determineFieldCategory(field)

		expect(result).toBe(FieldCategory.CUSTOM)
	})

	it('should categorize non-required, non-system, non-custom fields as OPTIONAL', () => {
		const field: JiraFieldMetadata = {
			id: 'description',
			name: 'Description',
			required: false,
			schema: { type: 'string' },
			custom: false,
		}

		const result = determineFieldCategory(field)

		expect(result).toBe(FieldCategory.OPTIONAL)
	})

	it('should prioritize REQUIRED over other categories', () => {
		const field: JiraFieldMetadata = {
			id: 'summary',
			name: 'Summary',
			required: true,
			schema: { type: 'string', system: 'summary' }, // Both required and system
			custom: true, // Also custom
		}

		const result = determineFieldCategory(field)

		expect(result).toBe(FieldCategory.REQUIRED)
	})

	it('should prioritize SYSTEM over CUSTOM', () => {
		const field: JiraFieldMetadata = {
			id: 'status',
			name: 'Status',
			required: false,
			schema: { type: 'status', system: 'status' }, // System field
			custom: true, // Also custom
		}

		const result = determineFieldCategory(field)

		expect(result).toBe(FieldCategory.SYSTEM)
	})
})
