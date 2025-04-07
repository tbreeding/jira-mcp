/**
 * Tests for wizard step ordering functionality
 */

import { WizardStep, WIZARD_STEP_ORDER, isStepAtOrBeyond } from '../types'

describe('Wizard Step Ordering', () => {
	describe('WIZARD_STEP_ORDER', () => {
		it('should have an entry for each WizardStep', () => {
			// Verify all enum values are in the mapping
			const allEnumKeys = Object.values(WizardStep)
			const allMappingKeys = Object.keys(WIZARD_STEP_ORDER)

			// Check that all enum values have a mapping
			allEnumKeys.forEach((step) => {
				expect(WIZARD_STEP_ORDER).toHaveProperty(step)
			})

			// Check that mapping doesn't have extra keys
			expect(allMappingKeys.length).toBe(allEnumKeys.length)
		})

		it('should maintain the correct order of steps', () => {
			// Test the relative ordering
			expect(WIZARD_STEP_ORDER[WizardStep.INITIATE]).toBeLessThan(WIZARD_STEP_ORDER[WizardStep.PROJECT_SELECTION])
			expect(WIZARD_STEP_ORDER[WizardStep.PROJECT_SELECTION]).toBeLessThan(
				WIZARD_STEP_ORDER[WizardStep.ISSUE_TYPE_SELECTION],
			)
			expect(WIZARD_STEP_ORDER[WizardStep.ISSUE_TYPE_SELECTION]).toBeLessThan(
				WIZARD_STEP_ORDER[WizardStep.FIELD_COMPLETION],
			)
			expect(WIZARD_STEP_ORDER[WizardStep.FIELD_COMPLETION]).toBeLessThan(WIZARD_STEP_ORDER[WizardStep.REVIEW])
			expect(WIZARD_STEP_ORDER[WizardStep.REVIEW]).toBeLessThan(WIZARD_STEP_ORDER[WizardStep.SUBMISSION])
		})
	})

	describe('isStepAtOrBeyond', () => {
		it('should return true when steps are the same', () => {
			Object.values(WizardStep).forEach((step) => {
				expect(isStepAtOrBeyond(step as WizardStep, step as WizardStep)).toBe(true)
			})
		})

		it('should return true when currentStep is beyond requiredStep', () => {
			expect(isStepAtOrBeyond(WizardStep.FIELD_COMPLETION, WizardStep.PROJECT_SELECTION)).toBe(true)
			expect(isStepAtOrBeyond(WizardStep.REVIEW, WizardStep.FIELD_COMPLETION)).toBe(true)
			expect(isStepAtOrBeyond(WizardStep.SUBMISSION, WizardStep.INITIATE)).toBe(true)
		})

		it('should return false when currentStep is before requiredStep', () => {
			expect(isStepAtOrBeyond(WizardStep.INITIATE, WizardStep.PROJECT_SELECTION)).toBe(false)
			expect(isStepAtOrBeyond(WizardStep.PROJECT_SELECTION, WizardStep.FIELD_COMPLETION)).toBe(false)
			expect(isStepAtOrBeyond(WizardStep.FIELD_COMPLETION, WizardStep.SUBMISSION)).toBe(false)
		})

		it('should handle invalid step values gracefully', () => {
			expect(isStepAtOrBeyond('invalid_step' as WizardStep, WizardStep.PROJECT_SELECTION)).toBe(false)
			expect(isStepAtOrBeyond(WizardStep.PROJECT_SELECTION, 'invalid_step' as WizardStep)).toBe(false)
			expect(isStepAtOrBeyond('invalid_step1' as WizardStep, 'invalid_step2' as WizardStep)).toBe(false)
		})
	})
})
