/**
 * Status Utility Functions
 *
 * Helper functions for calculating and processing wizard status information.
 */

import { WizardStep } from '../types'
import type { WizardState } from '../types'

/**
 * Calculate the overall progress percentage based on current step
 */
export function calculateProgress(currentStep: string): number {
	// Map steps to approximate progress percentages
	const progressMap: Record<string, number> = {
		initiate: 0,
		project_selection: 20,
		issue_type_selection: 40,
		field_completion: 60,
		review: 80,
		submission: 90,
	}

	return progressMap[currentStep] || 0
}

/**
 * Handle project selection step completion status
 */
function handleProjectSelectionStep(state: WizardState): { complete: boolean; requiredFields?: string[] } {
	return {
		complete: !!state.projectKey,
		requiredFields: state.projectKey ? [] : ['projectKey'],
	}
}

/**
 * Handle issue type selection step completion status
 */
function handleIssueTypeSelectionStep(state: WizardState): { complete: boolean; requiredFields?: string[] } {
	return {
		complete: !!state.issueTypeId,
		requiredFields: state.issueTypeId ? [] : ['issueTypeId'],
	}
}

/**
 * Handle field completion step completion status
 */
function handleFieldCompletionStep(state: WizardState): { complete: boolean; requiredFields?: string[] } {
	const hasRequiredFields = state.fields && Object.keys(state.fields).length > 0
	return {
		complete: hasRequiredFields,
		requiredFields: hasRequiredFields ? [] : ['summary'],
	}
}

/**
 * Handle default step completion status
 */
function handleDefaultStep(): { complete: boolean; requiredFields?: string[] } {
	return { complete: true }
}

/**
 * Calculate completion status for the current step
 */
export function calculateStepCompletion(state: WizardState): { complete: boolean; requiredFields?: string[] } {
	// Route to the appropriate handler based on the current step
	if (state.currentStep === WizardStep.PROJECT_SELECTION) return handleProjectSelectionStep(state)
	if (state.currentStep === WizardStep.ISSUE_TYPE_SELECTION) return handleIssueTypeSelectionStep(state)
	if (state.currentStep === WizardStep.FIELD_COMPLETION) return handleFieldCompletionStep(state)

	// Default for other steps
	return handleDefaultStep()
}
