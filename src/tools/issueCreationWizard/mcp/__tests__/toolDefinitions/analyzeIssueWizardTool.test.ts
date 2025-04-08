/**
 * Unit Tests for Analyze Issue Wizard Tool Definition
 *
 * These tests verify the correctness of the analyzeIssueWizardTool definition,
 * ensuring it has the expected name, description, and input schema.
 */

import { analyzeIssueWizardTool } from '../../toolDefinitions/analyzeIssueWizardTool'

describe('analyzeIssueWizardTool', () => {
	it('should have the correct name', () => {
		expect(analyzeIssueWizardTool.name).toBe('issueCreation_analyzeIssue')
	})

	it('should have a descriptive description', () => {
		const description = analyzeIssueWizardTool.description as string
		expect(description).toContain('Analyzes the issue')
		expect(description.length).toBeGreaterThan(20)
	})

	it('should have a valid input schema', () => {
		expect(analyzeIssueWizardTool.inputSchema).toBeDefined()
		expect(analyzeIssueWizardTool.inputSchema.type).toBe('object')

		const schema = analyzeIssueWizardTool.inputSchema
		expect(schema.properties).toBeDefined()
		expect(schema.properties?.random_string).toBeDefined()
		expect(schema.required).toContain('random_string')
	})

	it('should have the dummy parameter for no-parameter tools', () => {
		const properties = analyzeIssueWizardTool.inputSchema.properties
		const randomString = properties?.random_string as { type: string; description: string }

		expect(randomString.type).toBe('string')
		expect(randomString.description).toContain('Dummy parameter')
	})
})
