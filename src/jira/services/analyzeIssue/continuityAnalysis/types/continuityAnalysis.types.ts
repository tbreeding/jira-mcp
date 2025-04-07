/**
 * This file defines the TypeScript interfaces used throughout the continuity analysis system.
 * It contains type definitions for key domain objects like stagnation periods, work fragmentation,
 * context switching events, and the overall continuity analysis results. These strongly-typed
 * interfaces ensure consistency in data structure across the codebase and provide rich
 * documentation of the domain model, enhancing code maintainability and developer understanding.
 */

export interface StagnationPeriod {
	startDate: string
	endDate: string
	durationDays: number
	status: string
	assignee: string | null
}

export interface CommunicationGap {
	startDate: string
	endDate: string
	durationDays: number
}

export interface ContextSwitchEvent {
	date: string
	fromAssignee: string | null
	toAssignee: string | null
	status: string
	daysFromStart: number
}

export interface ContextSwitchAnalysis {
	count: number
	timing: ContextSwitchEvent[]
	impact: string
}

export interface WorkFragmentationAnalysis {
	fragmentationScore: number
	activeWorkPeriods: number
}

export interface LateStageChange {
	date: string
	field: string
	description: string
	percentComplete: number
}

export interface ActiveWorkPeriod {
	startDate: string
	endDate: string
	durationHours: number
	status: string
	assignee: string | null
}

export interface QuestionResponsePair {
	questionTimestamp: string
	responseTimestamp: string
	responseTimeHours: number
}

export interface ContinuityAnalysisResult {
	flowEfficiency: number
	stagnationPeriods: StagnationPeriod[]
	longestStagnationPeriod: number
	communicationGaps: CommunicationGap[]
	contextSwitches: ContextSwitchAnalysis
	momentumScore: number
	workFragmentation: WorkFragmentationAnalysis
	lateStageChanges: LateStageChange[]
	feedbackResponseTime: number
}
