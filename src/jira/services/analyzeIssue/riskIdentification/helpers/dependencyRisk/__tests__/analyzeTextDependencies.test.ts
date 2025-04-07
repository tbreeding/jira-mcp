/**
 * Tests for the analyzeTextDependencies function
 */

import { detectRiskIndicators } from '../../../utils/detectRiskIndicators'
import { analyzeTextDependencies } from '../analyzeTextDependencies'

// Mock the detectRiskIndicators function
jest.mock('../../../utils/detectRiskIndicators')

describe('analyzeTextDependencies', () => {
	beforeEach(() => {
		jest.resetAllMocks()
	})

	it('should identify dependency risks and return proper analysis', () => {
		// Setup mocks
		const mockDependencyResult = {
			present: true,
			indicators: ['Dependency Risk: dependency found in text'],
			severity: 'medium',
		}

		const mockExternalResult = {
			present: true,
			indicators: ['External Dependency Risk: external team found in text'],
			severity: 'high',
		}

		// Mock implementation for different calls
		;(detectRiskIndicators as jest.Mock).mockImplementation((text, patterns, category) => {
			if (category === 'Dependency Risk') {
				return mockDependencyResult
			}
			if (category === 'External Dependency Risk') {
				return mockExternalResult
			}
			return { present: false, indicators: [], severity: 'low' }
		})

		// Call the function
		const result = analyzeTextDependencies('Test text with dependencies and external team mention')

		// Verify the detectRiskIndicators was called correctly
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)

		// Check results
		expect(result.riskItems).toHaveLength(2)
		expect(result.riskItems[0]).toContain('Dependency risk:')
		expect(result.riskItems[1]).toContain('External dependency risk:')
		expect(result.mitigationSuggestions).toHaveLength(3)
		expect(result.scoreIncrease).toBe(5) // 2 for medium + 3 for high
	})

	it('should handle no risks found', () => {
		// Setup mocks for no risks found
		;(detectRiskIndicators as jest.Mock).mockReturnValue({
			present: false,
			indicators: [],
			severity: 'low',
		})

		// Call the function
		const result = analyzeTextDependencies('Test text with no dependency mentions')

		// Verify correct calls
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)

		// Check results
		expect(result.riskItems).toHaveLength(0)
		expect(result.mitigationSuggestions).toHaveLength(0)
		expect(result.scoreIncrease).toBe(0)
	})

	it('should handle null text input', () => {
		// Call the function with null
		const result = analyzeTextDependencies(null as unknown as string)

		// Verify the detectRiskIndicators was called correctly with empty string
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(1, '', expect.any(Array), 'Dependency Risk')
		expect(detectRiskIndicators).toHaveBeenNthCalledWith(2, '', expect.any(Array), 'External Dependency Risk')

		// Check results
		expect(result.riskItems).toHaveLength(0)
		expect(result.mitigationSuggestions).toHaveLength(0)
		expect(result.scoreIncrease).toBe(0)
	})

	it('should handle low severity risk indicators', () => {
		// Setup mocks for low severity risks
		const mockDependencyResult = {
			present: true,
			indicators: ['Dependency Risk: minor dependency mentioned'],
			severity: 'low',
		}

		const mockExternalResult = {
			present: false,
			indicators: [],
			severity: 'low',
		}

		// Mock implementation
		;(detectRiskIndicators as jest.Mock).mockImplementation((text, patterns, category) => {
			if (category === 'Dependency Risk') {
				return mockDependencyResult
			}
			return mockExternalResult
		})

		// Call the function
		const result = analyzeTextDependencies('Test text with minor dependency mention')

		// Verify the detectRiskIndicators was called correctly
		expect(detectRiskIndicators).toHaveBeenCalledTimes(2)

		// Check results
		expect(result.riskItems).toHaveLength(1)
		expect(result.riskItems[0]).toContain('Dependency risk:')
		expect(result.mitigationSuggestions).toHaveLength(0) // No suggestions for low severity
		expect(result.scoreIncrease).toBe(1) // 1 for low severity
	})
})
