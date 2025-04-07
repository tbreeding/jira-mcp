/**
 * Issue Creation Wizard Step Requirements
 *
 * This module defines the requirements for each step in the Jira Issue Creation Wizard.
 * It provides functions to check if a step is complete and identify missing requirements.
 */

import { log } from '../../utils/logger'
import { WizardStep } from './types'
import type { WizardState } from './types'

const STEP_REQUIREMENTS: Record<WizardStep, (state: WizardState) => boolean> = {
	[WizardStep.INITIATE]: () => true, // Always complete
	[WizardStep.PROJECT_SELECTION]: (state) => Boolean(state.projectKey),
	[WizardStep.ISSUE_TYPE_SELECTION]: (state) => Boolean(state.projectKey && state.issueTypeId),
	[WizardStep.FIELD_COMPLETION]: (state) => {
		// Require project, issue type, and at least the required fields
		return Boolean(
			state.projectKey &&
				state.issueTypeId &&
				Object.keys(state.fields).length > 0 &&
				Object.keys(state.validation.errors).length === 0,
		)
	},
	[WizardStep.REVIEW]: (state) => {
		// All previous requirements plus no validation errors
		return STEP_REQUIREMENTS[WizardStep.FIELD_COMPLETION](state)
	},
	[WizardStep.SUBMISSION]: (state) => {
		// Same as review, potentially with additional checks
		return STEP_REQUIREMENTS[WizardStep.REVIEW](state)
	},
}

function getMissingRequirementsForProjectSelection(state: WizardState): string[] {
	const missing: string[] = []
	if (!state.projectKey) {
		missing.push('Project selection')
	}
	return missing
}

function getMissingRequirementsForIssueTypeSelection(state: WizardState): string[] {
	const missing = getMissingRequirementsForProjectSelection(state)
	if (!state.issueTypeId) {
		missing.push('Issue type selection')
	}
	return missing
}

function getMissingRequirementsForFieldCompletion(state: WizardState): string[] {
	const missing = getMissingRequirementsForIssueTypeSelection(state)

	if (Object.keys(state.fields).length === 0) {
		missing.push('Required fields')
	}

	if (Object.keys(state.validation.errors).length > 0) {
		missing.push('Valid field values (validation errors exist)')
	}

	return missing
}

const requirementHandlers: Record<WizardStep, (state: WizardState) => string[]> = {
	[WizardStep.INITIATE]: () => [],
	[WizardStep.PROJECT_SELECTION]: getMissingRequirementsForProjectSelection,
	[WizardStep.ISSUE_TYPE_SELECTION]: getMissingRequirementsForIssueTypeSelection,
	[WizardStep.FIELD_COMPLETION]: getMissingRequirementsForFieldCompletion,
	[WizardStep.REVIEW]: getMissingRequirementsForFieldCompletion,
	[WizardStep.SUBMISSION]: getMissingRequirementsForFieldCompletion,
}

export function getMissingRequirements(state: WizardState, step: WizardStep): string[] {
	const handler = requirementHandlers[step]

	if (!handler) {
		log(`ERROR: No requirements defined for step ${step}`)
		return ['Unknown step']
	}
	return handler(state)
}

/**
 * Checks if the current state meets requirements for the given step
 */
export function checkStepRequirements(state: WizardState, step: WizardStep): boolean {
	const requirementFn = STEP_REQUIREMENTS[step]
	if (!requirementFn) {
		log(`ERROR: No requirements defined for step ${step}`)
		return false
	}

	return requirementFn(state)
}
