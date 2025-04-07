/**
 * Tests for the Issue Creation Wizard Step Progress
 *
 * This module contains tests for the step progression functions
 * that track wizard progress and determine next/previous steps.
 */

import { describe, expect, it } from '@jest/globals'
import { getNextStep, getPreviousStep, calculateWizardProgress } from '../stepProgress'
import { WizardStep } from '../types'
import type { WizardState } from '../types'

describe('Wizard Step Progress', () => {
	describe('getNextStep', () => {
		it('should return the next step in the sequence', () => {
			expect(getNextStep(WizardStep.INITIATE)).toBe(WizardStep.PROJECT_SELECTION)
			expect(getNextStep(WizardStep.PROJECT_SELECTION)).toBe(WizardStep.ISSUE_TYPE_SELECTION)
			expect(getNextStep(WizardStep.ISSUE_TYPE_SELECTION)).toBe(WizardStep.FIELD_COMPLETION)
			expect(getNextStep(WizardStep.FIELD_COMPLETION)).toBe(WizardStep.REVIEW)
			expect(getNextStep(WizardStep.REVIEW)).toBe(WizardStep.SUBMISSION)
		})

		it('should return null if there is no next step', () => {
			expect(getNextStep(WizardStep.SUBMISSION)).toBeNull()
		})
	})

	describe('getPreviousStep', () => {
		it('should return the previous step in the sequence', () => {
			expect(getPreviousStep(WizardStep.PROJECT_SELECTION)).toBe(WizardStep.INITIATE)
			expect(getPreviousStep(WizardStep.ISSUE_TYPE_SELECTION)).toBe(WizardStep.PROJECT_SELECTION)
			expect(getPreviousStep(WizardStep.FIELD_COMPLETION)).toBe(WizardStep.ISSUE_TYPE_SELECTION)
			expect(getPreviousStep(WizardStep.REVIEW)).toBe(WizardStep.FIELD_COMPLETION)
			expect(getPreviousStep(WizardStep.SUBMISSION)).toBe(WizardStep.REVIEW)
		})

		it('should return null if there is no previous step', () => {
			expect(getPreviousStep(WizardStep.INITIATE)).toBeNull()
		})
	})

	describe('calculateWizardProgress', () => {
		const baseState: WizardState = {
			active: true,
			currentStep: WizardStep.INITIATE,
			fields: {},
			validation: {
				errors: {},
				warnings: {},
			},
			timestamp: Date.now(),
		}

		it('should calculate 0% progress for INITIATE step', () => {
			const progress = calculateWizardProgress({
				...baseState,
				currentStep: WizardStep.INITIATE,
			})
			expect(progress).toBe(0)
		})

		it('should calculate higher progress for later steps', () => {
			const initProgress = calculateWizardProgress({
				...baseState,
				currentStep: WizardStep.INITIATE,
			})

			const projectProgress = calculateWizardProgress({
				...baseState,
				currentStep: WizardStep.PROJECT_SELECTION,
			})

			const typeProgress = calculateWizardProgress({
				...baseState,
				currentStep: WizardStep.ISSUE_TYPE_SELECTION,
			})

			expect(projectProgress).toBeGreaterThan(initProgress)
			expect(typeProgress).toBeGreaterThan(projectProgress)
		})

		it('should give bonus progress for completed steps', () => {
			const incompleteProgress = calculateWizardProgress({
				...baseState,
				currentStep: WizardStep.PROJECT_SELECTION,
			})

			const completeProgress = calculateWizardProgress({
				...baseState,
				currentStep: WizardStep.PROJECT_SELECTION,
				projectKey: 'TEST', // This makes the step complete
			})

			expect(completeProgress).toBeGreaterThan(incompleteProgress)
		})

		it('should calculate 100% progress for completed SUBMISSION step', () => {
			const progress = calculateWizardProgress({
				...baseState,
				currentStep: WizardStep.SUBMISSION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				fields: { summary: 'Test Issue' },
			})
			expect(progress).toBe(100)
		})
	})
})
