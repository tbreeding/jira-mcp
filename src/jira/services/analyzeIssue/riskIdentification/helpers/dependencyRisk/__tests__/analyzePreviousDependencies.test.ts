/**
 * Tests for the analyzePreviousDependencies function
 */

import { analyzePreviousDependencies } from '../analyzePreviousDependencies'
import type { Dependencies } from '../../../../dependenciesAnalysis/types/dependencies.types'

describe('analyzePreviousDependencies', () => {
	it('should handle undefined dependencies', () => {
		// Call with undefined
		const result = analyzePreviousDependencies(undefined)

		// Should return empty arrays and zero score
		expect(result.riskItems).toEqual([])
		expect(result.mitigationSuggestions).toEqual([])
		expect(result.scoreIncrease).toBe(0)
	})

	it('should analyze blockers correctly', () => {
		// Test dependencies with blockers
		const mockDependencies = {
			blockers: [
				{ id: 'PROJ-123', summary: 'First blocker' },
				{ id: 'PROJ-124', summary: 'Second blocker' },
			],
		} as unknown as Dependencies

		// Call the function
		const result = analyzePreviousDependencies(mockDependencies)

		// Check results
		expect(result.riskItems).toContain('Issue has 2 linked blocker issues')
		expect(result.mitigationSuggestions).toContain('Address blocking issues before starting implementation')
		expect(result.scoreIncrease).toBe(4) // Capped at 4 for blockers
	})

	it('should analyze external dependencies correctly', () => {
		// Test dependencies with external dependencies
		const mockDependencies = {
			externalDependencies: [
				{ team: 'Team A', type: 'API' },
				{ team: 'Team B', type: 'API' },
				{ team: 'Team C', type: 'Data' },
			],
		} as unknown as Dependencies

		// Call the function
		const result = analyzePreviousDependencies(mockDependencies)

		// Check results
		expect(result.riskItems).toContain('Issue has 3 external dependencies identified')
		expect(result.scoreIncrease).toBe(3) // Capped at 3 for external dependencies
	})

	it('should handle combined dependencies', () => {
		// Test dependencies with both blockers and external dependencies
		const mockDependencies = {
			blockers: [{ id: 'PROJ-123', summary: 'Blocker' }],
			externalDependencies: [{ team: 'Team A', type: 'API' }],
		} as unknown as Dependencies

		// Call the function
		const result = analyzePreviousDependencies(mockDependencies)

		// Check results
		expect(result.riskItems).toHaveLength(2)
		expect(result.riskItems[0]).toContain('linked blocker issue')
		expect(result.riskItems[1]).toContain('external dependencies identified')
		expect(result.mitigationSuggestions).toHaveLength(1)
		expect(result.scoreIncrease).toBe(3) // 2 for one blocker + 1 for one external dependency
	})
})
