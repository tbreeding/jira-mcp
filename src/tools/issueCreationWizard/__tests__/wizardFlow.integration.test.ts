/**
 * Integration Tests for the Issue Creation Wizard Flow
 *
 * This module contains integration tests for the full Jira issue creation wizard
 * flow, testing the entire state transition lifecycle from initiation to submission.
 */

import { describe, expect, it, beforeEach } from '@jest/globals'
import { StateManager } from '../stateManager'
import { StateManagerCore } from '../stateManagerCore'
import { WizardStep } from '../types'

// Using a real StateManagerCore for integration tests
describe('Wizard Flow Integration', () => {
	let stateManager: StateManager
	let core: StateManagerCore

	beforeEach(() => {
		core = new StateManagerCore()
		stateManager = new StateManager(core)
	})

	it('should initialize a new wizard with correct initial state', () => {
		const result = stateManager.initializeState()
		expect(result.success).toBe(true)

		if (result.success) {
			const state = result.data
			expect(state.active).toBe(true)
			expect(state.currentStep).toBe(WizardStep.INITIATE)
			expect(state.fields).toEqual({})
			expect(state.validation.errors).toEqual({})
			expect(state.validation.warnings).toEqual({})
		}
	})

	it('should follow a complete successful flow from start to finish', () => {
		// Initialize wizard
		const initResult = stateManager.initializeState()
		expect(initResult.success).toBe(true)

		// Step 1: Move from INITIATE to PROJECT_SELECTION
		const step1Result = stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
		})
		expect(step1Result.success).toBe(true)

		// Step 2: Set project key
		const step2Result = stateManager.updateState({
			projectKey: 'TEST',
		})
		expect(step2Result.success).toBe(true)

		// Step 3: Move to ISSUE_TYPE_SELECTION
		const step3Result = stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		})
		expect(step3Result.success).toBe(true)

		// Step 4: Set issue type
		const step4Result = stateManager.updateState({
			issueTypeId: '10001',
		})
		expect(step4Result.success).toBe(true)

		// Step 5: Move to FIELD_COMPLETION
		const step5Result = stateManager.updateState({
			currentStep: WizardStep.FIELD_COMPLETION,
		})
		expect(step5Result.success).toBe(true)

		// Step 6: Add field values
		const step6Result = stateManager.updateState({
			fields: {
				summary: 'Test Issue',
				description: 'This is a test issue',
			},
		})
		expect(step6Result.success).toBe(true)

		// Step 7: Move to REVIEW
		const step7Result = stateManager.updateState({
			currentStep: WizardStep.REVIEW,
		})
		expect(step7Result.success).toBe(true)

		// Step 8: Move to SUBMISSION
		const step8Result = stateManager.updateState({
			currentStep: WizardStep.SUBMISSION,
		})
		expect(step8Result.success).toBe(true)

		// Verify final state
		const state = stateManager.getState()
		expect(state.success).toBe(true)

		if (state.success) {
			expect(state.data.currentStep).toBe(WizardStep.SUBMISSION)
			expect(state.data.projectKey).toBe('TEST')
			expect(state.data.issueTypeId).toBe('10001')
			expect(state.data.fields).toHaveProperty('summary')
			expect(state.data.fields).toHaveProperty('description')
		}
	})

	it('should prevent skipping steps', () => {
		// Initialize wizard
		stateManager.initializeState()

		// Try to skip directly to ISSUE_TYPE_SELECTION
		const skipResult = stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		})

		expect(skipResult.success).toBe(false)

		// Verify we're still at the initial step
		const state = stateManager.getState()
		expect(state.success).toBe(true)

		if (state.success) {
			expect(state.data.currentStep).toBe(WizardStep.INITIATE)
		}
	})

	it('should prevent moving forward without meeting requirements', () => {
		// Initialize wizard
		stateManager.initializeState()

		// Move to PROJECT_SELECTION
		const step1Result = stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
		})
		expect(step1Result.success).toBe(true)

		// Try to move to ISSUE_TYPE_SELECTION without setting projectKey
		const invalidStepResult = stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		})

		expect(invalidStepResult.success).toBe(false)

		// Verify we're still at PROJECT_SELECTION
		const state = stateManager.getState()
		expect(state.success).toBe(true)

		if (state.success) {
			expect(state.data.currentStep).toBe(WizardStep.PROJECT_SELECTION)
		}
	})

	it('should allow moving backward even with incomplete steps', () => {
		// Initialize wizard and move to PROJECT_SELECTION
		stateManager.initializeState()
		stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
		})

		// Set project and move to ISSUE_TYPE_SELECTION
		stateManager.updateState({
			projectKey: 'TEST',
		})
		stateManager.updateState({
			currentStep: WizardStep.ISSUE_TYPE_SELECTION,
		})

		// Go back to PROJECT_SELECTION
		const backResult = stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
		})

		expect(backResult.success).toBe(true)

		// Verify we're back at PROJECT_SELECTION
		const state = stateManager.getState()
		expect(state.success).toBe(true)

		if (state.success) {
			expect(state.data.currentStep).toBe(WizardStep.PROJECT_SELECTION)
			// Project key should be preserved
			expect(state.data.projectKey).toBe('TEST')
		}
	})

	it('should reset state correctly', () => {
		// Initialize and set some state
		stateManager.initializeState()
		stateManager.updateState({
			currentStep: WizardStep.PROJECT_SELECTION,
			projectKey: 'TEST',
		})

		// Reset state
		const resetResult = stateManager.resetState()
		expect(resetResult.success).toBe(true)
		expect(resetResult.data.reset).toBe(true)

		// Verify wizard is no longer active
		expect(stateManager.isActive()).toBe(false)

		// Getting state should fail
		const stateResult = stateManager.getState()
		expect(stateResult.success).toBe(false)
	})
})
