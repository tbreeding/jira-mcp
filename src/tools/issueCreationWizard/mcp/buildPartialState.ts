/**
 * Builds a partial state object for updating the wizard state
 * by explicitly setting properties from provided parameters
 */

import { log } from '../../../utils/logger'
import { WizardStep } from '../types'
import type { WizardState } from '../types'

/**
 * Checks if a given step value is a valid WizardStep.
 */
function isValidStep(step: unknown): step is WizardStep {
	return step != null && Object.values(WizardStep).includes(step as WizardStep)
}

/**
 * Builds a partial state object from the provided update payload.
 * Only includes properties that are explicitly provided (not null or undefined).
 */
export function buildPartialState(
	step: unknown,
	projectKey: unknown,
	issueTypeId: unknown,
	fields: unknown,
): Partial<WizardState> {
	const partialState: Partial<WizardState> = {}

	// Check if step is valid before assigning
	if (isValidStep(step)) {
		partialState.currentStep = step
		log(`Setting currentStep to: ${step}`)
	}

	// Check if projectKey is not null/undefined
	if (projectKey != null) {
		partialState.projectKey = projectKey as string
		log(`Setting projectKey to: ${projectKey}`)
	}

	// Check if issueTypeId is not null/undefined
	if (issueTypeId != null) {
		partialState.issueTypeId = issueTypeId as string
		log(`Setting issueTypeId to: ${issueTypeId}`)
	}

	// Check if fields is not null/undefined
	if (fields != null) {
		partialState.fields = fields as Record<string, unknown>
		const stringifiedFields = JSON.stringify(fields)
		const previewLength = stringifiedFields.length > 100 ? '...' : ''
		log(`Setting fields: ${stringifiedFields.substring(0, 100)}${previewLength}`)
	}

	return partialState
}
