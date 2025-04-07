/**
 * Unit tests for the Wizard State Helpers
 */

import { WizardStep } from '../../types'
import { checkWizardState } from '../wizardStateHelpers'
import type { StateManager } from '../../stateManager'

// Remove the mock for StateManager
// jest.mock('../../stateManager')

describe('wizardStateHelpers', () => {
	let mockStateManager: jest.Mocked<StateManager>

	beforeEach(() => {
		// Clear all mocks and reset StateManager
		jest.clearAllMocks()

		// Setup the mock StateManager directly
		mockStateManager = {
			getState: jest.fn(),
		} as unknown as jest.Mocked<StateManager>
	})

	describe('checkWizardState', () => {
		it('should return error when wizard is not active', async () => {
			// Mock state manager to return inactive state
			mockStateManager.getState.mockReturnValue({
				success: true,
				data: {
					active: false,
					currentStep: WizardStep.INITIATE,
					fields: {},
					validation: { errors: {}, warnings: {} },
					timestamp: Date.now(),
				},
			})

			const result = await checkWizardState(mockStateManager, WizardStep.INITIATE)

			expect(result.success).toBe(false)
			expect(result.errorMessage).toBe('No active wizard. Initialize one first.')
		})

		it('should return error when getState fails', async () => {
			// Mock state manager to return failure
			mockStateManager.getState.mockReturnValue({
				success: false,
				error: { code: 'TEST_ERROR', message: 'Test error' },
			})

			const result = await checkWizardState(mockStateManager, WizardStep.INITIATE)

			expect(result.success).toBe(false)
			expect(result.errorMessage).toBe('No active wizard. Initialize one first.')
		})

		it('should return error when current step is before required step', async () => {
			// Mock state manager to return active state but at an earlier step
			mockStateManager.getState.mockReturnValue({
				success: true,
				data: {
					active: true,
					currentStep: WizardStep.INITIATE,
					projectKey: 'TEST',
					issueTypeId: '10000',
					fields: {},
					validation: { errors: {}, warnings: {} },
					timestamp: Date.now(),
				},
			})

			const result = await checkWizardState(mockStateManager, WizardStep.FIELD_COMPLETION)

			expect(result.success).toBe(false)
			expect(result.errorMessage).toBe('Previous steps must be completed first.')
		})

		it('should return error when project key is missing', async () => {
			// Mock state manager to return active state but missing project key
			mockStateManager.getState.mockReturnValue({
				success: true,
				data: {
					active: true,
					currentStep: WizardStep.PROJECT_SELECTION,
					// No projectKey
					issueTypeId: '10000',
					fields: {},
					validation: { errors: {}, warnings: {} },
					timestamp: Date.now(),
				},
			})

			const result = await checkWizardState(mockStateManager, WizardStep.PROJECT_SELECTION)

			expect(result.success).toBe(false)
			expect(result.errorMessage).toBe('Project and issue type must be selected.')
		})

		it('should return error when issue type id is missing', async () => {
			// Mock state manager to return active state but missing issue type id
			mockStateManager.getState.mockReturnValue({
				success: true,
				data: {
					active: true,
					currentStep: WizardStep.ISSUE_TYPE_SELECTION,
					projectKey: 'TEST',
					// No issueTypeId
					fields: {},
					validation: { errors: {}, warnings: {} },
					timestamp: Date.now(),
				},
			})

			const result = await checkWizardState(mockStateManager, WizardStep.ISSUE_TYPE_SELECTION)

			expect(result.success).toBe(false)
			expect(result.errorMessage).toBe('Project and issue type must be selected.')
		})

		it('should return success when all requirements are met', async () => {
			const mockStateData = {
				active: true,
				currentStep: WizardStep.FIELD_COMPLETION,
				projectKey: 'TEST',
				issueTypeId: '10000',
				fields: { summary: 'Test Issue' },
				validation: { errors: {}, warnings: {} },
				timestamp: Date.now(),
			}

			// Mock state manager to return valid state
			mockStateManager.getState.mockReturnValue({
				success: true,
				data: mockStateData,
			})

			const result = await checkWizardState(mockStateManager, WizardStep.FIELD_COMPLETION)

			expect(result.success).toBe(true)
			expect(result.state).toEqual(mockStateData)
			expect(result.projectKey).toBe('TEST')
			expect(result.issueTypeId).toBe('10000')
		})

		it('should return success when required step is before current step', async () => {
			const mockStateData = {
				active: true,
				currentStep: WizardStep.REVIEW,
				projectKey: 'TEST',
				issueTypeId: '10000',
				fields: { summary: 'Test Issue' },
				validation: { errors: {}, warnings: {} },
				timestamp: Date.now(),
			}

			// Mock state manager to return valid state with step beyond required
			mockStateManager.getState.mockReturnValue({
				success: true,
				data: mockStateData,
			})

			const result = await checkWizardState(mockStateManager, WizardStep.FIELD_COMPLETION)

			expect(result.success).toBe(true)
			expect(result.state).toEqual(mockStateData)
		})
	})
})
