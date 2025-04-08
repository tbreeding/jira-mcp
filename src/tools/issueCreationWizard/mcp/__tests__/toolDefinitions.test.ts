/**
 * Tool Definitions Tests
 *
 * This module contains unit tests for the Issue Creation Wizard tool definitions.
 * It verifies that tool definitions have the required properties and valid schemas.
 */

import { WizardStep } from '../../types'
import { createIssueWizardTool } from '../toolDefinitions/createIssueWizardTool'
import { getProjectsWizardTool } from '../toolDefinitions/getProjectsWizardTool'
import { getStateWizardTool } from '../toolDefinitions/getStateWizardTool'
import { getStatusWizardTool } from '../toolDefinitions/getStatusWizardTool'
import { resetStateWizardTool } from '../toolDefinitions/resetStateWizardTool'
import { updateStateWizardTool } from '../toolDefinitions/updateStateWizardTool'

// Define interface for schema property types
interface SchemaProperty {
	type: string
	description?: string
	enum?: string[]
	additionalProperties?: boolean
}

interface SchemaDefinition {
	type: string
	properties?: Record<string, SchemaProperty>
	required?: string[]
}

describe('Issue Creation Wizard Tool Definitions', () => {
	describe('getStateWizardTool', () => {
		test('should have the correct name', () => {
			expect(getStateWizardTool.name).toBe('issueCreation_getState')
		})

		test('should have a description', () => {
			expect(getStateWizardTool.description).toBeTruthy()
		})

		test('should have a valid schema', () => {
			expect(getStateWizardTool.inputSchema).toBeDefined()
			expect(getStateWizardTool.inputSchema.type).toBe('object')
		})
	})

	describe('getStatusWizardTool', () => {
		test('should have the correct name', () => {
			expect(getStatusWizardTool.name).toBe('issueCreation_getStatus')
		})

		test('should have a description', () => {
			expect(getStatusWizardTool.description).toBeTruthy()
		})

		test('should have a valid schema', () => {
			expect(getStatusWizardTool.inputSchema).toBeDefined()
			expect(getStatusWizardTool.inputSchema.type).toBe('object')
		})
	})

	describe('resetStateWizardTool', () => {
		test('should have the correct name', () => {
			expect(resetStateWizardTool.name).toBe('issueCreation_resetState')
		})

		test('should have a description', () => {
			expect(resetStateWizardTool.description).toBeTruthy()
		})

		test('should have a valid schema', () => {
			expect(resetStateWizardTool.inputSchema).toBeDefined()
			expect(resetStateWizardTool.inputSchema.type).toBe('object')
		})
	})

	describe('updateStateWizardTool', () => {
		test('should have the correct name', () => {
			expect(updateStateWizardTool.name).toBe('issueCreation_updateState')
		})

		test('should have a description', () => {
			expect(updateStateWizardTool.description).toBeTruthy()
		})

		test('should have a valid schema', () => {
			expect(updateStateWizardTool.inputSchema).toBeDefined()
			expect(updateStateWizardTool.inputSchema.type).toBe('object')
		})

		test('should accept step parameter with valid wizard steps', () => {
			const schema = updateStateWizardTool.inputSchema as SchemaDefinition
			const stepProp = schema.properties?.step as SchemaProperty
			expect(stepProp).toBeDefined()
			expect(stepProp.type).toBe('string')
			expect(stepProp.enum).toEqual(Object.values(WizardStep))
		})

		test('should accept projectKey parameter', () => {
			const schema = updateStateWizardTool.inputSchema as SchemaDefinition
			const projectKeyProp = schema.properties?.projectKey as SchemaProperty
			expect(projectKeyProp).toBeDefined()
			expect(projectKeyProp.type).toBe('string')
		})

		test('should accept issueTypeId parameter', () => {
			const schema = updateStateWizardTool.inputSchema as SchemaDefinition
			const issueTypeIdProp = schema.properties?.issueTypeId as SchemaProperty
			expect(issueTypeIdProp).toBeDefined()
			expect(issueTypeIdProp.type).toBe('string')
		})

		test('should accept fields parameter', () => {
			const schema = updateStateWizardTool.inputSchema as SchemaDefinition
			const fieldsProp = schema.properties?.fields as SchemaProperty
			expect(fieldsProp).toBeDefined()
			expect(fieldsProp.type).toBe('object')
			expect(fieldsProp.additionalProperties).toBe(true)
		})
	})

	describe('createIssueWizardTool', () => {
		test('should have the correct name', () => {
			expect(createIssueWizardTool.name).toBe('issueCreation_createIssue')
		})

		test('should have a description', () => {
			expect(createIssueWizardTool.description).toBeTruthy()
		})

		test('should have a valid schema', () => {
			expect(createIssueWizardTool.inputSchema).toBeDefined()
			expect(createIssueWizardTool.inputSchema.type).toBe('object')
		})
	})

	describe('getProjectsWizardTool', () => {
		test('should have the correct name', () => {
			expect(getProjectsWizardTool.name).toBe('issueCreation_getProjects')
		})

		test('should have a description', () => {
			expect(getProjectsWizardTool.description).toBeTruthy()
		})

		test('should have a valid schema', () => {
			expect(getProjectsWizardTool.inputSchema).toBeDefined()
			expect(getProjectsWizardTool.inputSchema.type).toBe('object')
		})

		test('should accept forceRefresh parameter', () => {
			const schema = getProjectsWizardTool.inputSchema as SchemaDefinition
			const forceRefreshProp = schema.properties?.forceRefresh as SchemaProperty
			expect(forceRefreshProp).toBeDefined()
			expect(forceRefreshProp.type).toBe('boolean')
		})
	})
})
