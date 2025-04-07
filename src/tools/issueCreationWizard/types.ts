/**
 * Issue Creation Wizard Types
 *
 * This module defines the core type interfaces used by the Jira Issue Creation Wizard.
 * It includes the state structure, step enumeration, and related type definitions
 * that ensure consistency across the wizard implementation.
 */

// Correct relative path for CategorizedFields import
import type { CategorizedFields } from '../../jira/api/getAndCategorizeFields'

/**
 * Enumeration of wizard steps in the creation process
 */
export enum WizardStep {
	INITIATE = 'initiate',
	PROJECT_SELECTION = 'project_selection',
	ISSUE_TYPE_SELECTION = 'issue_type_selection',
	FIELD_COMPLETION = 'field_completion',
	REVIEW = 'review',
	SUBMISSION = 'submission',
}

/**
 * Maps each wizard step to its numeric order in the process
 * Used for comparing steps and determining progress
 */
export const WIZARD_STEP_ORDER: Record<WizardStep, number> = {
	[WizardStep.INITIATE]: 0,
	[WizardStep.PROJECT_SELECTION]: 1,
	[WizardStep.ISSUE_TYPE_SELECTION]: 2,
	[WizardStep.FIELD_COMPLETION]: 3,
	[WizardStep.REVIEW]: 4,
	[WizardStep.SUBMISSION]: 5,
}

/**
 * Compares two wizard steps and determines if one is at or beyond another
 */
export function isStepAtOrBeyond(currentStep: WizardStep, requiredStep: WizardStep): boolean {
	if (!WIZARD_STEP_ORDER.hasOwnProperty(currentStep) || !WIZARD_STEP_ORDER.hasOwnProperty(requiredStep)) {
		return false // Unknown steps are treated as not meeting the requirement
	}
	return WIZARD_STEP_ORDER[currentStep] >= WIZARD_STEP_ORDER[requiredStep]
}

/**
 * Interface representing the state of an issue creation wizard
 */
export interface WizardState {
	active: boolean
	currentStep: WizardStep
	projectKey?: string
	issueTypeId?: string
	fields: Record<string, unknown>
	validation: {
		errors: Record<string, string[]>
		warnings: Record<string, string[]>
	}
	analysis?: {
		metadata?: CategorizedFields
	}
	timestamp: number
	userConfirmation?: boolean // Whether user has explicitly approved issue creation
	analysisComplete?: boolean // Whether analysis has been completed
}

/**
 * Interface for wizard status response
 */
export interface WizardStatus {
	active: boolean
	currentStep?: WizardStep
	timestamp?: number
	timeElapsed?: number
	progress?: number
	hasValidationErrors?: boolean
	validationErrorCount?: number
	stepCompletion?: {
		complete: boolean
		requiredFields?: string[]
	}
}
