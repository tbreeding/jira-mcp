/**
 * Tests for the findTargetProject function
 */

import { findTargetProject } from '../findTargetProject'
import type { JiraFieldMetadataResponse } from '../../types/fieldMetadata.types'

describe('findTargetProject', () => {
	// Sample metadata for testing
	const mockMetadata: JiraFieldMetadataResponse = {
		projects: [
			{
				id: '10000',
				key: 'TEST',
				name: 'Test Project',
				issuetypes: [],
			},
			{
				id: '10001',
				key: 'SECOND',
				name: 'Second Project',
				issuetypes: [],
			},
		],
	}

	it('should find project by key', () => {
		const result = findTargetProject(mockMetadata, 'TEST', '')

		expect(result.error).toBeUndefined()
		expect(result.value).toBeDefined()
		expect(result.value?.key).toBe('TEST')
		expect(result.value?.id).toBe('10000')
	})

	it('should find project by ID', () => {
		const result = findTargetProject(mockMetadata, '', '10001')

		expect(result.error).toBeUndefined()
		expect(result.value).toBeDefined()
		expect(result.value?.key).toBe('SECOND')
		expect(result.value?.id).toBe('10001')
	})

	it('should find project by key when both key and ID are provided', () => {
		// Should prioritize finding by key
		const result = findTargetProject(mockMetadata, 'TEST', '10001')

		expect(result.error).toBeUndefined()
		expect(result.value).toBeDefined()
		expect(result.value?.key).toBe('TEST')
		expect(result.value?.id).toBe('10000')
	})

	it('should return error when project is not found by key', () => {
		const result = findTargetProject(mockMetadata, 'NONEXISTENT', '')

		expect(result.error).toBeDefined()
		expect(result.error?.message).toContain('No project found with key "NONEXISTENT"')
		expect(result.value).toBeUndefined()
	})

	it('should return error when project is not found by ID', () => {
		const result = findTargetProject(mockMetadata, '', '99999')

		expect(result.error).toBeDefined()
		expect(result.error?.message).toContain('No project found with key "" or ID "99999"')
		expect(result.value).toBeUndefined()
	})

	it('should return error when both key and ID are not found', () => {
		const result = findTargetProject(mockMetadata, 'NONEXISTENT', '99999')

		expect(result.error).toBeDefined()
		expect(result.error?.message).toContain('No project found with key "NONEXISTENT" or ID "99999"')
		expect(result.value).toBeUndefined()
	})

	it('should handle empty metadata', () => {
		const emptyMetadata: JiraFieldMetadataResponse = {
			projects: [],
		}

		const result = findTargetProject(emptyMetadata, 'TEST', '10000')

		expect(result.error).toBeDefined()
		expect(result.error?.message).toContain('No project found with key "TEST" or ID "10000"')
		expect(result.value).toBeUndefined()
	})
})
