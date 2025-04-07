import { WizardStep } from '../../types'
import { buildPartialState } from '../buildPartialState'
import { log } from '../../../../utils/logger' // Corrected path

// Mock the logger to prevent actual logging during tests and allow spying
jest.mock('../../../../utils/logger')

const mockLog = log as jest.Mock

describe('buildPartialState', function () {
	beforeEach(function () {
		mockLog.mockImplementation(() => {}) // Moved inside beforeEach
		mockLog.mockClear() // Clear mock calls before each test
	})

	it('should return an empty object if all inputs are undefined', function () {
		const result = buildPartialState(undefined, undefined, undefined, undefined)
		expect(result).toEqual({})
		expect(mockLog).not.toHaveBeenCalled()
	})

	it('should set currentStep if step is provided', function () {
		const step = WizardStep.PROJECT_SELECTION
		const result = buildPartialState(step, undefined, undefined, undefined)
		expect(result).toEqual({ currentStep: step })
		expect(mockLog).toHaveBeenCalledWith(`Setting currentStep to: ${step}`)
	})

	it('should set projectKey if projectKey is provided', function () {
		const projectKey = 'TEST-KEY'
		const result = buildPartialState(undefined, projectKey, undefined, undefined)
		expect(result).toEqual({ projectKey: projectKey })
		expect(mockLog).toHaveBeenCalledWith(`Setting projectKey to: ${projectKey}`)
	})

	it('should set issueTypeId if issueTypeId is provided', function () {
		const issueTypeId = '10001'
		const result = buildPartialState(undefined, undefined, issueTypeId, undefined)
		expect(result).toEqual({ issueTypeId: issueTypeId })
		expect(mockLog).toHaveBeenCalledWith(`Setting issueTypeId to: ${issueTypeId}`)
	})

	it('should set fields and log short fields correctly', function () {
		const fields = { summary: 'Short summary', description: 'Short desc' }
		const result = buildPartialState(undefined, undefined, undefined, fields)
		expect(result).toEqual({ fields: fields })
		// Expect log without '...'
		expect(mockLog).toHaveBeenCalledWith(`Setting fields: ${JSON.stringify(fields)}`)
	})

	it('should set fields and log long fields with ellipsis correctly', function () {
		const longDescription = 'a'.repeat(100) // Make it definitely longer than 100 chars when stringified
		const fields = { summary: 'Test', description: longDescription }
		const result = buildPartialState(undefined, undefined, undefined, fields)
		expect(result).toEqual({ fields: fields })
		// Expect log with '...'
		const expectedLogStart = `Setting fields: ${JSON.stringify(fields).substring(0, 100)}...`
		expect(mockLog).toHaveBeenCalledWith(expectedLogStart)
	})

	it('should handle a combination of parameters', function () {
		const step = WizardStep.FIELD_COMPLETION
		const projectKey = 'PROJ'
		const issueTypeId = '12345'
		const fields = { priority: 'High' }
		const result = buildPartialState(step, projectKey, issueTypeId, fields)
		expect(result).toEqual({
			currentStep: step,
			projectKey: projectKey,
			issueTypeId: issueTypeId,
			fields: fields,
		})
		expect(mockLog).toHaveBeenCalledWith(`Setting currentStep to: ${step}`)
		expect(mockLog).toHaveBeenCalledWith(`Setting projectKey to: ${projectKey}`)
		expect(mockLog).toHaveBeenCalledWith(`Setting issueTypeId to: ${issueTypeId}`)
		expect(mockLog).toHaveBeenCalledWith(`Setting fields: ${JSON.stringify(fields)}`)
	})

	it('should ignore non-WizardStep values for step', function () {
		const invalidStep = 'NOT_A_STEP'
		const result = buildPartialState(invalidStep, undefined, undefined, undefined)
		expect(result).toEqual({}) // Should not set currentStep
		expect(mockLog).not.toHaveBeenCalled()
	})

	it('should handle empty object for fields', function () {
		const fields = {}
		const result = buildPartialState(undefined, undefined, undefined, fields)
		expect(result).toEqual({ fields: {} })
		expect(mockLog).toHaveBeenCalledWith(`Setting fields: ${JSON.stringify(fields)}`)
	})

	it('should handle null values for parameters (treating them as undefined)', function () {
		const result = buildPartialState(null, null, null, null)
		expect(result).toEqual({})
		expect(mockLog).not.toHaveBeenCalled()
	})
})
