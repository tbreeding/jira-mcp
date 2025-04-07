/**
 * Tests for duration risk helper functions
 */

import {
	checkSprintBoundaryIssues,
	checkSprintReassignments,
	checkStatusCycling,
	checkBlockedTime,
	checkDurationAnomalies,
} from '../helpers/durationRiskHelpers'
import type { DurationAssessment } from '../../durationAssessment/types/durationAssessment.types'

describe('Duration Risk Helpers', () => {
	describe('checkSprintBoundaryIssues', () => {
		test('returns 0 if no sprint boundary issues', () => {
			const mockDurationData = {
				exceedsSprint: false,
			} as unknown as DurationAssessment

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkSprintBoundaryIssues(mockDurationData, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
			expect(mitigationSuggestions.length).toBe(0)
		})

		test('returns 2 and adds risk item when sprint boundary issues exist', () => {
			const mockDurationData = {
				exceedsSprint: true,
			} as unknown as DurationAssessment

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkSprintBoundaryIssues(mockDurationData, riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('exceed sprint boundary')
			expect(mitigationSuggestions.length).toBe(1)
		})
	})

	describe('checkSprintReassignments', () => {
		test('returns 0 if no sprint reassignments', () => {
			const mockDurationData = {
				sprintReassignments: 0,
			} as unknown as DurationAssessment

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkSprintReassignments(mockDurationData, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
		})

		test('returns score equal to reassignments up to max of 4', () => {
			const mockDurationData = {
				sprintReassignments: 3,
			} as unknown as DurationAssessment

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkSprintReassignments(mockDurationData, riskItems, mitigationSuggestions)

			expect(score).toBe(3)
			expect(riskItems.length).toBe(1)
			expect(mitigationSuggestions.length).toBe(1)
		})
	})

	describe('checkStatusCycling', () => {
		test('returns 0 if no status cycling', () => {
			const mockDurationData = {
				statusCycling: { totalRevisits: 0 },
			} as unknown as DurationAssessment

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkStatusCycling(mockDurationData, riskItems, mitigationSuggestions)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
		})

		test('returns 2 if status cycling detected', () => {
			const mockDurationData = {
				statusCycling: { totalRevisits: 3 },
			} as unknown as DurationAssessment

			const riskItems: string[] = []
			const mitigationSuggestions: string[] = []

			const score = checkStatusCycling(mockDurationData, riskItems, mitigationSuggestions)

			expect(score).toBe(2)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('cycled through statuses')
		})
	})

	describe('checkBlockedTime', () => {
		test('returns 0 if blocked for short time', () => {
			const mockDurationData = {
				blockedTime: { totalDays: 2 },
			} as unknown as DurationAssessment

			const riskItems: string[] = []

			const score = checkBlockedTime(mockDurationData, riskItems)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
		})

		test('returns appropriate score based on blocked time', () => {
			const mockDurationData = {
				blockedTime: { totalDays: 8 },
			} as unknown as DurationAssessment

			const riskItems: string[] = []

			const score = checkBlockedTime(mockDurationData, riskItems)

			expect(score).toBe(3) // Capped at 3
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('blocked for')
		})
	})

	describe('checkDurationAnomalies', () => {
		test('returns 0 if no anomalies', () => {
			const mockDurationData = {
				anomalies: [],
			} as unknown as DurationAssessment

			const riskItems: string[] = []

			const score = checkDurationAnomalies(mockDurationData, riskItems)

			expect(score).toBe(0)
			expect(riskItems.length).toBe(0)
		})

		test('returns 1 and adds first anomaly as risk item', () => {
			const mockDurationData = {
				anomalies: ['Issue took 3x longer than similar issues'],
			} as unknown as DurationAssessment

			const riskItems: string[] = []

			const score = checkDurationAnomalies(mockDurationData, riskItems)

			expect(score).toBe(1)
			expect(riskItems.length).toBe(1)
			expect(riskItems[0]).toContain('Duration anomalies')
		})
	})
})
