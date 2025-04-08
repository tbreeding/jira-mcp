/**
 * Tests for setUserConfirmationWizardTool
 *
 * This file contains tests to verify the definition of the setUserConfirmationWizardTool.
 */

import { setUserConfirmationWizardTool } from '../../toolDefinitions/setUserConfirmationWizardTool'

describe('setUserConfirmationWizardTool', () => {
	it('should have the correct name', () => {
		expect(setUserConfirmationWizardTool.name).toBe('issueCreation_setUserConfirmation')
	})

	it('should have a description', () => {
		expect(setUserConfirmationWizardTool.description).toBeTruthy()
		expect(typeof setUserConfirmationWizardTool.description).toBe('string')
		expect(setUserConfirmationWizardTool.description).toContain('CRITICAL')
	})

	it('should have an input schema with required properties', () => {
		expect(setUserConfirmationWizardTool.inputSchema).toBeDefined()
		expect(setUserConfirmationWizardTool.inputSchema?.type).toBe('object')

		const properties = setUserConfirmationWizardTool.inputSchema?.properties
		expect(properties).toBeDefined()

		expect(setUserConfirmationWizardTool.inputSchema?.required).toContain('confirmed')
	})

	it('should define the confirmed property correctly', () => {
		const properties = setUserConfirmationWizardTool.inputSchema?.properties
		expect(properties).toBeDefined()

		if (properties) {
			const confirmedProperty = properties.confirmed as { type: string; description: string }
			expect(confirmedProperty).toBeDefined()
			expect(confirmedProperty.type).toBe('boolean')
			expect(confirmedProperty.description).toBeTruthy()
		}
	})
})
