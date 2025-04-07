/**
 * Tests for the Issue Creation Wizard State Machine
 *
 * This module contains tests for the state machine that manages transitions
 * between steps in the wizard flow.
 */

import { describe, expect, it } from '@jest/globals'
import { transitionState, isValidTransition, ALLOWED_TRANSITIONS } from '../stateMachine'
import { WizardStep } from '../types'
import type { WizardState } from '../types'

describe('Wizard State Machine', () => {
	describe('isValidTransition', () => {
		it('should allow valid transitions defined in ALLOWED_TRANSITIONS', () => {
			// Test a few transitions from different steps
			expect(isValidTransition(WizardStep.INITIATE, WizardStep.PROJECT_SELECTION)).toBe(true)
			expect(isValidTransition(WizardStep.PROJECT_SELECTION, WizardStep.ISSUE_TYPE_SELECTION)).toBe(true)
			expect(isValidTransition(WizardStep.PROJECT_SELECTION, WizardStep.INITIATE)).toBe(true)
			expect(isValidTransition(WizardStep.FIELD_COMPLETION, WizardStep.REVIEW)).toBe(true)
		})

		it('should disallow transitions not defined in ALLOWED_TRANSITIONS', () => {
			// Test a few invalid transitions
			expect(isValidTransition(WizardStep.INITIATE, WizardStep.ISSUE_TYPE_SELECTION)).toBe(false)
			expect(isValidTransition(WizardStep.PROJECT_SELECTION, WizardStep.REVIEW)).toBe(false)
			expect(isValidTransition(WizardStep.REVIEW, WizardStep.ISSUE_TYPE_SELECTION)).toBe(false)
		})

		it('should return false for a step not defined in ALLOWED_TRANSITIONS', () => {
			// Use a value that's not a valid WizardStep
			const invalidStep = 'INVALID_STEP' as WizardStep // Type assertion for testing
			expect(isValidTransition(invalidStep, WizardStep.PROJECT_SELECTION)).toBe(false)
		})
	})

	describe('transitionState', () => {
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

		it('should return the same state if target step is the same as current step', () => {
			const result = transitionState(baseState, WizardStep.INITIATE)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.currentStep).toBe(WizardStep.INITIATE)
			}
		})

		it('should fail for invalid transitions', () => {
			const result = transitionState(baseState, WizardStep.ISSUE_TYPE_SELECTION)
			expect(result.success).toBe(false)
		})

		it('should succeed for valid forward transitions with complete requirements', () => {
			// Create a state with project key set
			const stateWithProject: WizardState = {
				...baseState,
				currentStep: WizardStep.PROJECT_SELECTION,
				projectKey: 'TEST',
			}

			const result = transitionState(stateWithProject, WizardStep.ISSUE_TYPE_SELECTION)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.currentStep).toBe(WizardStep.ISSUE_TYPE_SELECTION)
			}
		})

		it('should fail for forward transitions with incomplete requirements', () => {
			// Create a state with project selection step but no project key
			const incompleteState: WizardState = {
				...baseState,
				currentStep: WizardStep.PROJECT_SELECTION,
				// No project key
			}

			const result = transitionState(incompleteState, WizardStep.ISSUE_TYPE_SELECTION)
			expect(result.success).toBe(false)
		})

		it('should allow backward transitions even with incomplete requirements', () => {
			// Create a state at ISSUE_TYPE_SELECTION step but missing required fields
			const state: WizardState = {
				...baseState,
				currentStep: WizardStep.ISSUE_TYPE_SELECTION,
				// No project key, which would be required
			}

			const result = transitionState(state, WizardStep.PROJECT_SELECTION)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.currentStep).toBe(WizardStep.PROJECT_SELECTION)
			}
		})

		it('should update the timestamp on successful transitions', () => {
			const oldTimestamp = baseState.timestamp

			// Wait a small amount to ensure timestamp changes
			const delay = () => new Promise((resolve) => setTimeout(resolve, 5))
			return delay().then(() => {
				const result = transitionState(baseState, WizardStep.PROJECT_SELECTION)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data.timestamp).toBeGreaterThan(oldTimestamp)
				}
			})
		})
	})

	describe('ALLOWED_TRANSITIONS', () => {
		it('should define transitions for all wizard steps', () => {
			const steps = Object.values(WizardStep)

			// Ensure each step has defined transitions
			steps.forEach((step) => {
				expect(ALLOWED_TRANSITIONS[step]).toBeDefined()
				expect(Array.isArray(ALLOWED_TRANSITIONS[step])).toBe(true)
			})
		})

		it('should define backwards transitions for all steps except INITIATE', () => {
			const steps = Object.values(WizardStep)

			// For each step (except INITIATE), check if it can go back
			steps.forEach((step) => {
				if (step !== WizardStep.INITIATE) {
					// The step should be able to transition to a step with lower index
					const canGoBack = ALLOWED_TRANSITIONS[step].some(
						(targetStep) => Object.values(WizardStep).indexOf(targetStep) < Object.values(WizardStep).indexOf(step),
					)
					expect(canGoBack).toBe(true)
				}
			})
		})
	})
})
