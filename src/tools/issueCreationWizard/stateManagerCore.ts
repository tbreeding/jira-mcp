/**
 * Issue Creation Wizard State Manager Core
 *
 * This module contains the core implementation for the StateManager.
 */

import { v4 as uuidv4 } from 'uuid'
import { log } from '../../utils/logger'
import type { WizardState } from './types'

/**
 * State manager core for the Issue Creation Wizard
 */
export class StateManagerCore {
	private state: WizardState | null = null
	private readonly instanceId: string

	/**
	 * Constructor for StateManagerCore
	 */
	constructor() {
		this.instanceId = uuidv4()
		log(`[DEBUG] StateManagerCore constructor called, process ID: ${process.pid}, instance ID: ${this.instanceId}`)
	}

	/**
	 * Get the current state
	 */
	public getStateValue(): WizardState | null {
		return this.state
	}

	/**
	 * Set the state value
	 */
	public setStateValue(state: WizardState | null): void {
		const prevState = this.state

		// Log existing state before replacement

		log(`[DEBUG] Replacing state: Current state=${JSON.stringify(this.state)}, New state=${JSON.stringify(state)}`)

		// Create a completely fresh copy to ensure no reference issues
		this.state = state ? JSON.parse(JSON.stringify(state)) : null

		if (state) {
			// Log state transition details
			const transition = prevState
				? `TRANSITION: ${prevState.currentStep} → ${state.currentStep}`
				: `INITIAL: ${state.currentStep}`

			log(`[DEBUG] ${transition} | Instance ID: ${this.instanceId}`)

			if (prevState?.currentStep === state.currentStep && prevState.currentStep !== 'initiate') {
				log(`[DEBUG] WARNING: Step did not change from ${prevState.currentStep}`)
			}
		} else {
			// State has been reset to null
			log(`[DEBUG] State reset to null | Instance ID: ${this.instanceId}`)
		}
	}
}
