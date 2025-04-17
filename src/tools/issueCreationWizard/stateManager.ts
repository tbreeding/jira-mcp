/**
 * Issue Creation Wizard State Manager
 *
 * This module provides the public API for the Jira Issue Creation Wizard state.
 * It delegates core state handling to other modules while maintaining a clean public API.
 */

// This file is not , so we disable the file-length rule
/* eslint-disable custom-rules/file-length */
import { createSuccess } from '../../errors/types'
import { log } from '../../utils/logger'
import { initializeWizardState } from './operations/initializeWizardState'
import { updateWizardState } from './operations/updateWizardState'
import { isStateActive, getNoActiveWizardError, getAlreadyActiveWizardError, createResetResult } from './stateAccessors'
import { deserializeState, serializeState } from './stateSerialization'
import { WizardStep } from './types'
import type { StateManagerCore } from './stateManagerCore'
import type { WizardState, WizardMode } from './types'
import type { ErrorResult } from '../../errors/types'
import type { JiraIssue } from '../../jira/types/issue.types'

/**
 * Public API for the Issue Creation Wizard state
 */
export class StateManager {
	/**
	 * Constructor with dependency injection for the core implementation
	 */
	constructor(private readonly core: StateManagerCore) {
		log(`[DEBUG] StateManager instance created`)
	}

	/**
	 * Check if wizard is currently active
	 */
	public isActive(): boolean {
		return isStateActive(this.core.getStateValue())
	}

	/**
	 * Initialize a new wizard state
	 */
	public initializeState(): { success: true; data: WizardState } | ErrorResult {
		if (this.isActive()) {
			return getAlreadyActiveWizardError()
		}

		const state = initializeWizardState()
		this.core.setStateValue(state)
		return createSuccess(state)
	}

	/**
	 * Get the current wizard state
	 */
	public getState(): { success: true; data: WizardState } | ErrorResult {
		if (!this.isActive()) {
			return getNoActiveWizardError()
		}
		return createSuccess(this.core.getStateValue() as WizardState)
	}

	/**
	 * Reset the wizard state
	 */
	public resetState(): { success: true; data: { reset: boolean } } {
		this.core.setStateValue(null)
		log('Reset wizard state')
		return createResetResult()
	}

	/**
	 * Update the wizard state
	 * @param partialState Partial state to update
	 * @param options Options for state update (e.g., forceStepTransition)
	 *   - forceStepTransition: If true, allows jump transitions (used for loading existing issues)
	 */
	public updateState(
		partialState: Partial<WizardState>,
		options: { forceStepTransition?: boolean } = {},
	): { success: true; data: WizardState } | ErrorResult {
		if (!this.isActive()) {
			return getNoActiveWizardError()
		}

		const currentState = this.core.getStateValue() as WizardState

		// Log state transition attempt
		log(
			`[DEBUG] StateManager.updateState | Current state: ${JSON.stringify({
				step: currentState.currentStep,
				projectKey: currentState.projectKey || '(not set)',
			})}`,
		)
		log(
			`[DEBUG] StateManager.updateState | Update payload: ${JSON.stringify(partialState)}, options: ${JSON.stringify(options)}`,
		)

		const result = updateWizardState(currentState, partialState, options.forceStepTransition ?? false)

		if (result.success) {
			// Create a completely fresh copy to ensure no reference sharing
			const freshState = JSON.parse(JSON.stringify(result.data))
			this.core.setStateValue(freshState)

			// Log the updated state
			log(
				`[DEBUG] StateManager.updateState | Update successful: ${JSON.stringify({
					newStep: freshState.currentStep,
					newProjectKey: freshState.projectKey,
					fields: Object.keys(freshState.fields).length,
				})}`,
			)
		} else {
			log(`[DEBUG] StateManager.updateState | Update failed: ${JSON.stringify(result.error)}`)
		}

		return result
	}

	/**
	 * Serialize the state to JSON string
	 */
	public serializeState(): { success: true; data: string } | ErrorResult {
		if (!this.isActive()) {
			return getNoActiveWizardError()
		}
		return serializeState(this.core.getStateValue() as WizardState)
	}

	/**
	 * Deserialize the state from JSON string
	 * @param serializedState Serialized state string
	 */
	public deserializeState(serializedState: string): { success: true; data: WizardState } | ErrorResult {
		const result = deserializeState(serializedState)

		if (result.success) {
			this.core.setStateValue(result.data)
		}

		return result
	}

	/**
	 * Load an issue into the state manager for updating
	 */
	public loadIssueState(issueData: JiraIssue): { success: true; data: WizardState } | ErrorResult {
		// Don't reset existing state if we're already working with this issue
		// This casting is safe because we check if the state is active first
		if (this.isActive() && (this.core.getStateValue() as WizardState).issueKey === issueData.key) {
			return createSuccess(this.core.getStateValue() as WizardState)
		}

		// Reset any existing state
		this.resetState()

		// Initialize a new state
		const initResult = this.initializeState()
		if (!initResult.success) {
			return initResult
		}

		// Determine the correct step
		const hasProject = Boolean(issueData.fields.project?.key)
		const hasIssueType = Boolean(issueData.fields.issuetype?.id)
		let currentStep = WizardStep.INITIATE
		if (hasProject && hasIssueType) {
			currentStep = WizardStep.FIELD_COMPLETION
		}

		// Update with issue data and correct step, forcing step transition
		return this.updateState(
			{
				issueKey: issueData.key,
				projectKey: issueData.fields.project?.key,
				issueTypeId: issueData.fields.issuetype?.id,
				mode: 'updating' as WizardMode,
				currentStep,
			},
			{ forceStepTransition: true },
		)
	}
}
