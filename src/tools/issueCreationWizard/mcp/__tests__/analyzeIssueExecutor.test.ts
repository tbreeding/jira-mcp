/**
 * Unit Tests for Analyze Issue Wizard Tool Executor
 *
 * These tests verify the functionality of the analyzeIssueWizardToolExecutor function,
 * ensuring it properly analyzes a Jira issue based on the wizard state.
 */

import { WizardStep } from '../../types'
import { analyzeIssueWizardToolExecutor } from '../analyzeIssueExecutor'
import type { StateManager } from '../../stateManager'

describe('analyzeIssueWizardToolExecutor', () => {
	// Mock state manager
	const mockStateManager = {
		getState: jest.fn(),
	} as unknown as StateManager

	// Reset mocks before each test
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return a success result with prompt and data when state is valid and step is allowed', async () => {
		// Mock the state response for a valid step
		mockStateManager.getState = jest.fn().mockReturnValue({
			success: true,
			data: {
				currentStep: WizardStep.FIELD_COMPLETION,
				projectKey: 'TEST',
				issueTypeId: '10001',
				fields: { summary: 'Test Issue', description: 'Description' },
				validation: { errors: {}, warnings: {} },
				analysis: { metadata: {} },
			},
		})

		// Create the executor and call it
		const executor = analyzeIssueWizardToolExecutor(mockStateManager)
		const result = await executor({} as any)

		// Verify the result matches the expected structure
		expect(result.content).toBeDefined()
		expect(result.isError).toBeUndefined()

		// Check that content contains expected JSON
		const content = result.content[0].text
		expect(content).toContain('"success": true')
		expect(content).toContain('"prompt"')
		expect(content).toContain('senior Agile coach')
		expect(content).toContain('"data"')
		expect(content).toContain('"projectKey": "TEST"')
		expect(content).toContain('"issueTypeId": "10001"')
		expect(content).toContain('"summary": "Test Issue"')

		// Verify the state manager was called
		expect(mockStateManager.getState).toHaveBeenCalledTimes(1)
	})

	it('should return an error result when state retrieval fails', async () => {
		// Mock a failed state retrieval
		mockStateManager.getState = jest.fn().mockReturnValue({
			success: false,
			error: { message: 'Failed to get state' },
		})

		// Create the executor and call it
		const executor = analyzeIssueWizardToolExecutor(mockStateManager)
		const result = await executor({} as any)

		// Verify the result
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Failed to get state')

		// Verify the state manager was called
		expect(mockStateManager.getState).toHaveBeenCalledTimes(1)
	})

	it('should return an error when the current step is not allowed for analysis', async () => {
		// Test each disallowed step
		const disallowedSteps = [WizardStep.INITIATE, WizardStep.PROJECT_SELECTION, WizardStep.ISSUE_TYPE_SELECTION]

		for (const step of disallowedSteps) {
			// Mock the state response for an invalid step
			mockStateManager.getState = jest.fn().mockReturnValue({
				success: true,
				data: {
					currentStep: step,
					projectKey: 'TEST',
					issueTypeId: '10001',
					fields: {},
					validation: { errors: {}, warnings: {} },
				},
			})

			// Create the executor and call it
			const executor = analyzeIssueWizardToolExecutor(mockStateManager)
			const result = await executor({} as any)

			// Verify the result
			expect(result.isError).toBe(true)
			expect(result.content[0].text).toContain('Analysis is not allowed at this step')

			// Verify the state manager was called
			expect(mockStateManager.getState).toHaveBeenCalledTimes(1)
		}
	})

	it('should return an error if an exception occurs during execution', async () => {
		// Mock an exception during state retrieval
		mockStateManager.getState = jest.fn().mockImplementation(() => {
			throw new Error('Unexpected error')
		})

		// Create the executor and call it
		const executor = analyzeIssueWizardToolExecutor(mockStateManager)
		const result = await executor({} as any)

		// Verify the result
		expect(result.isError).toBe(true)
		expect(result.content[0].text).toContain('Unexpected error')

		// Verify the state manager was called
		expect(mockStateManager.getState).toHaveBeenCalledTimes(1)
	})

	it('should handle all valid steps for analysis', async () => {
		// Test each allowed step
		const allowedSteps = [WizardStep.FIELD_COMPLETION, WizardStep.REVIEW, WizardStep.SUBMISSION]

		for (const step of allowedSteps) {
			// Mock the state response for a valid step
			mockStateManager.getState = jest.fn().mockReturnValue({
				success: true,
				data: {
					currentStep: step,
					projectKey: 'TEST',
					issueTypeId: '10001',
					fields: {},
					validation: { errors: {}, warnings: {} },
				},
			})

			// Create the executor and call it
			const executor = analyzeIssueWizardToolExecutor(mockStateManager)
			const result = await executor({} as any)

			// Verify the result
			expect(result.isError).toBeUndefined()
			expect(result.content).toBeDefined()
			expect(result.content[0].text).toContain('"success": true')
			expect(result.content[0].text).toContain('"prompt"')
			expect(result.content[0].text).toContain('"data"')

			// Verify the state manager was called
			expect(mockStateManager.getState).toHaveBeenCalledTimes(1)
		}
	})
})
