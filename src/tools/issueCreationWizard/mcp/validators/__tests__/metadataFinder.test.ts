/**
 * Tests for Metadata Finder
 */

import { FieldCategory } from '../../../../../jira/types/fieldMetadata.types'
import { findFieldMetadata } from '../metadataFinder'
import type { CategorizedFields } from '../../../../../jira/api/getAndCategorizeFields'

describe('Metadata Finder', () => {
	// Create mock field metadata
	const mockFields: CategorizedFields = {
		[FieldCategory.REQUIRED]: [
			{
				id: 'required-field-1',
				name: 'Required Field 1',
				category: FieldCategory.REQUIRED,
				metadata: {
					id: 'required-field-1',
					name: 'Required Field 1',
					required: true,
					schema: { type: 'string' },
				},
			},
		],
		[FieldCategory.SYSTEM]: [
			{
				id: 'system-field-1',
				name: 'System Field 1',
				category: FieldCategory.SYSTEM,
				metadata: {
					id: 'system-field-1',
					name: 'System Field 1',
					required: false,
					schema: { type: 'string' },
				},
			},
		],
		[FieldCategory.CUSTOM]: [
			{
				id: 'custom-field-1',
				name: 'Custom Field 1',
				category: FieldCategory.CUSTOM,
				metadata: {
					id: 'custom-field-1',
					name: 'Custom Field 1',
					required: false,
					schema: { type: 'string' },
				},
			},
		],
	}

	describe('findFieldMetadata', () => {
		it('should find a field in the REQUIRED category', () => {
			const result = findFieldMetadata('required-field-1', mockFields)

			expect(result).not.toBeNull()
			expect(result?.id).toBe('required-field-1')
			expect(result?.category).toBe(FieldCategory.REQUIRED)
		})

		it('should find a field in the SYSTEM category', () => {
			const result = findFieldMetadata('system-field-1', mockFields)

			expect(result).not.toBeNull()
			expect(result?.id).toBe('system-field-1')
			expect(result?.category).toBe(FieldCategory.SYSTEM)
		})

		it('should find a field in the CUSTOM category', () => {
			const result = findFieldMetadata('custom-field-1', mockFields)

			expect(result).not.toBeNull()
			expect(result?.id).toBe('custom-field-1')
			expect(result?.category).toBe(FieldCategory.CUSTOM)
		})

		it('should return null when field is not found', () => {
			const result = findFieldMetadata('non-existent-field', mockFields)

			expect(result).toBeNull()
		})

		it('should handle empty field metadata', () => {
			const emptyFields: CategorizedFields = {
				[FieldCategory.REQUIRED]: [],
				[FieldCategory.SYSTEM]: [],
				[FieldCategory.CUSTOM]: [],
			}

			const result = findFieldMetadata('any-field', emptyFields)

			expect(result).toBeNull()
		})
	})
})
