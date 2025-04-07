/**
 * Type definitions for the Jira issue analysis subsystem
 *
 * This file contains type definitions and interfaces that represent the structure
 * of analysis results and intermediate data formats used throughout the issue
 * analysis process, ensuring type safety and consistency.
 */

export interface IssueAnalysisResult {
	issueKey: string
	summary: string
	issueType: string

	// Overall quality score (1-10)
	qualityScore: number

	metadata: {
		issueType: string
		summary: string
		priorityAppropriate: boolean
		labelsAndComponentsAppropriate: boolean
		assignmentChanges: number
	}

	complexity: {
		score: number // 1-10 scale
		factors: string[]
		level: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very complex'
	}

	completeness: {
		score: number // 1-10 scale
		missingInformation: string[]
		suggestions: string[]
	}

	dependencies: {
		blockers: Array<{ key: string; summary: string }>
		relatedIssues: Array<{ key: string; summary: string; relationship?: string }>
		implicitDependencies: string[] // Dependencies mentioned in comments
		externalDependencies: string[] // External systems or teams
	}

	duration: {
		inProgressDays: number | null
		exceedsSprint: boolean
		sprintReassignments: number // Number of times moved between sprints
		pointToDurationRatio: number | null // Story points to days ratio
		statusTransitions: {
			firstInProgress: string | null // ISO date string
			lastDone: string | null // ISO date string
			averageTimeInStatus: Record<string, number> // Status name to hours
		}
		statusCycling: {
			count: Record<string, number> // Status name to number of re-entries
			totalRevisits: number // Total number of status revisits
		}
		blockedTime: {
			totalDays: number // Total days in blocked/on-hold statuses
			reasons: string[] // Extracted reasons for blockage
		}
		anomalies: string[] // Duration pattern anomalies
	}

	continuity: {
		flowEfficiency: number // Percentage of time in active work vs. total time
		stagnationPeriods: Array<{
			startDate: string // ISO date string
			endDate: string // ISO date string
			durationDays: number
			status: string // Status during stagnation
			assignee: string | null
		}>
		longestStagnationPeriod: number // Days
		communicationGaps: Array<{
			startDate: string // ISO date string
			endDate: string // ISO date string
			durationDays: number
		}>
		contextSwitches: {
			count: number
			timing: Array<{
				date: string // ISO date string
				fromAssignee: string | null
				toAssignee: string | null
				status: string
				daysFromStart: number
			}>
			impact: string // Assessment of impact on velocity
		}
		momentumScore: number // 1-10 scale (10 being perfect momentum)
		workFragmentation: {
			fragmentationScore: number // 1-10 scale (1 being most fragmented)
			activeWorkPeriods: number // Count of distinct active periods
		}
		lateStageChanges: Array<{
			date: string // ISO date string
			field: string
			description: string
			percentComplete: number // Estimated percentage of completion when change occurred
		}>
		feedbackResponseTime: number // Average hours between questions and responses
	}

	risks: {
		score: number // 1-10 scale
		items: string[]
		mitigationSuggestions: string[]
	}

	ambiguities: {
		items: string[]
		locations: Array<{ field: string; excerpt: string }>
	}

	implementationRecommendations: string[]
}
