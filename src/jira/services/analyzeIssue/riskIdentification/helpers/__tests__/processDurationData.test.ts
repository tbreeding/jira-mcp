/**
 * Tests for processDurationData helper
 *
 * This file contains tests for the processDurationData function, which
 * processes duration assessment data to identify timeline risks.
 */

import {
	checkSprintBoundaryIssues,
	checkSprintReassignments,
	checkStatusCycling,
	checkBlockedTime,
	checkDurationAnomalies,
} from '../durationRiskHelpers'
import { processDurationData } from '../processDurationData'
import type { DurationAssessment } from '../../../durationAssessment/types/durationAssessment.types'

// Mock dependencies
jest.mock('../durationRiskHelpers')

describe('processDurationData', () => {
	beforeEach(() => {
		jest.clearAllMocks()

		// Default mock implementations
		;(checkSprintBoundaryIssues as jest.Mock).mockReturnValue(0)
		;(checkSprintReassignments as jest.Mock).mockReturnValue(0)
		;(checkStatusCycling as jest.Mock).mockReturnValue(0)
		;(checkBlockedTime as jest.Mock).mockReturnValue(0)
		;(checkDurationAnomalies as jest.Mock).mockReturnValue(0)
	})

	// Test data
	const mockDurationData = {
		sprintBoundaries: {
			crossesSprints: true,
			numberOfSprints: 3,
		},
		sprintReassignments: [{ from: 'Sprint 1', to: 'Sprint 2' }],
		statusCycling: {
			hasStatusCycling: true,
			cyclingCount: 2,
		},
		blockedPeriods: [{ days: 3, reason: 'Waiting for approval' }],
		durationAnomalies: ['Issue took 20 days which is longer than average'],
	} as unknown as DurationAssessment

	test('calls all duration risk helper functions with correct parameters', () => {
		// Arrays to collect risk items and mitigation suggestions
		const riskItems: string[] = []
		const mitigationSuggestions: string[] = []

		// Call the function
		processDurationData(mockDurationData, riskItems, mitigationSuggestions)

		// Verify all helper functions are called with correct parameters
		expect(checkSprintBoundaryIssues).toHaveBeenCalledWith(mockDurationData, riskItems, mitigationSuggestions)

		expect(checkSprintReassignments).toHaveBeenCalledWith(mockDurationData, riskItems, mitigationSuggestions)

		expect(checkStatusCycling).toHaveBeenCalledWith(mockDurationData, riskItems, mitigationSuggestions)

		expect(checkBlockedTime).toHaveBeenCalledWith(mockDurationData, riskItems)

		expect(checkDurationAnomalies).toHaveBeenCalledWith(mockDurationData, riskItems)
	})

	test('combines score increments from all risk checks', () => {
		// Setup mocks to return specific score increments
		;(checkSprintBoundaryIssues as jest.Mock).mockReturnValue(1)
		;(checkSprintReassignments as jest.Mock).mockReturnValue(2)
		;(checkStatusCycling as jest.Mock).mockReturnValue(1.5)
		;(checkBlockedTime as jest.Mock).mockReturnValue(0.5)
		;(checkDurationAnomalies as jest.Mock).mockReturnValue(2)

		// Call the function
		const result = processDurationData(mockDurationData, [], [])

		// Verify the combined score
		// 1 + 2 + 1.5 + 0.5 + 2 = 7
		expect(result).toBe(7)
	})

	test('accumulates risk items from all risk checks', () => {
		// Arrays to collect risk items and mitigation suggestions
		const riskItems: string[] = []
		const mitigationSuggestions: string[] = []

		// Setup mocks to add risk items
		;(checkSprintBoundaryIssues as jest.Mock).mockImplementation((data, items) => {
			items.push('Sprint boundary risk item')
			return 1
		})
		;(checkSprintReassignments as jest.Mock).mockImplementation((data, items) => {
			items.push('Sprint reassignment risk item')
			return 1
		})
		;(checkStatusCycling as jest.Mock).mockImplementation((data, items) => {
			items.push('Status cycling risk item')
			return 1
		})
		;(checkBlockedTime as jest.Mock).mockImplementation((data, items) => {
			items.push('Blocked time risk item')
			return 1
		})
		;(checkDurationAnomalies as jest.Mock).mockImplementation((data, items) => {
			items.push('Duration anomaly risk item')
			return 1
		})

		// Call the function
		processDurationData(mockDurationData, riskItems, mitigationSuggestions)

		// Verify risk items are accumulated
		expect(riskItems).toContain('Sprint boundary risk item')
		expect(riskItems).toContain('Sprint reassignment risk item')
		expect(riskItems).toContain('Status cycling risk item')
		expect(riskItems).toContain('Blocked time risk item')
		expect(riskItems).toContain('Duration anomaly risk item')
		expect(riskItems.length).toBe(5)
	})

	test('accumulates mitigation suggestions from applicable risk checks', () => {
		// Arrays to collect risk items and mitigation suggestions
		const riskItems: string[] = []
		const mitigationSuggestions: string[] = []

		// Setup mocks to add mitigation suggestions
		;(checkSprintBoundaryIssues as jest.Mock).mockImplementation((data, items, suggestions) => {
			suggestions.push('Sprint boundary mitigation')
			return 1
		})
		;(checkSprintReassignments as jest.Mock).mockImplementation((data, items, suggestions) => {
			suggestions.push('Sprint reassignment mitigation')
			return 1
		})
		;(checkStatusCycling as jest.Mock).mockImplementation((data, items, suggestions) => {
			suggestions.push('Status cycling mitigation')
			return 1
		})

		// Call the function
		processDurationData(mockDurationData, riskItems, mitigationSuggestions)

		// Verify mitigation suggestions are accumulated
		expect(mitigationSuggestions).toContain('Sprint boundary mitigation')
		expect(mitigationSuggestions).toContain('Sprint reassignment mitigation')
		expect(mitigationSuggestions).toContain('Status cycling mitigation')
		expect(mitigationSuggestions.length).toBe(3)
	})

	test('returns zero when no risks are identified', () => {
		// All mocks return 0 by default, indicating no risks
		const result = processDurationData(mockDurationData, [], [])

		// Verify result is zero
		expect(result).toBe(0)
	})
})
