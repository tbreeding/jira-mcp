/**
 * Duration Assessment Type Definitions for Jira Issue Analysis
 *
 * This module defines the data structures used in the duration assessment analysis
 * system. It includes interfaces for representing various temporal aspects of issues,
 * such as status transitions, time periods, sprint changes, and blocked periods.
 * These type definitions provide structure for analyzing how long issues take to
 * resolve and what factors contribute to their lifecycle duration.
 */

export interface DurationAssessment {
	inProgressDays: number | null
	exceedsSprint: boolean
	sprintReassignments: number
	pointToDurationRatio: number | null
	statusTransitions: {
		firstInProgress: string | null
		lastDone: string | null
		averageTimeInStatus: Record<string, number>
	}
	statusCycling: {
		count: Record<string, number>
		totalRevisits: number
	}
	blockedTime: {
		totalDays: number
		reasons: string[]
	}
	anomalies: string[]
}

export interface StatusTransition {
	fromStatus: string | null
	toStatus: string | null
	fromStatusCategory: string | null
	toStatusCategory: string | null
	timestamp: string
}

export interface SprintChange {
	from: string[] | null
	to: string[] | null
	timestamp: string
}

export interface StatusPeriod {
	status: string
	statusCategory: string
	startTime: string
	endTime: string | null
}

export interface BlockedPeriod {
	startTime: string
	endTime: string | null
	reason: string | null
}
