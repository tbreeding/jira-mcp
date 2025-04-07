/**
 * Tests for setAnalysisCompleteWizardTool
 *
 * This file contains tests to verify the definition of the setAnalysisCompleteWizardTool.
 */

import { setAnalysisCompleteWizardTool } from '../../toolDefinitions/setAnalysisCompleteWizardTool'

describe('setAnalysisCompleteWizardTool', () => {
	it('should have the correct name', () => {
		expect(setAnalysisCompleteWizardTool.name).toBe('mcp_IssueCreationWizard_setAnalysisComplete')
	})

	it('should have a description', () => {
		expect(setAnalysisCompleteWizardTool.description).toBeTruthy()
		expect(typeof setAnalysisCompleteWizardTool.description).toBe('string')
	})

	it('should have an input schema with required properties', () => {
		expect(setAnalysisCompleteWizardTool.inputSchema).toBeDefined()
		expect(setAnalysisCompleteWizardTool.inputSchema.type).toBe('object')
		expect(setAnalysisCompleteWizardTool.inputSchema.properties).toBeDefined()
		expect(setAnalysisCompleteWizardTool.inputSchema.required).toContain('isComplete')
	})

	it('should define the isComplete property correctly', () => {
		const properties = setAnalysisCompleteWizardTool.inputSchema.properties
		expect(properties).toBeDefined()

		const isCompleteProperty = (properties as Record<string, unknown>).isComplete as {
			type: string
			description: string
		}
		expect(isCompleteProperty).toBeDefined()
		expect(isCompleteProperty.type).toBe('boolean')
		expect(isCompleteProperty.description).toBeTruthy()
	})
})
