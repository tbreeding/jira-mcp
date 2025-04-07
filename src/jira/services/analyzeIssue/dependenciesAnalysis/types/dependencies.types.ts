/**
 * Dependency Analysis Type Definitions
 *
 * This module defines the TypeScript interfaces used throughout the dependency analysis system.
 * It contains type definitions for different dependency categories, relationship types,
 * and structured representations of issue links and dependencies. These types provide
 * a consistent vocabulary for representing complex dependency relationships and enable
 * type-safe processing of dependency data throughout the analysis pipeline.
 */

export interface LinkedIssue {
	key: string
	summary: string
	relationship?: string
}

export interface Dependencies {
	blockers: LinkedIssue[]
	relatedIssues: LinkedIssue[]
	implicitDependencies: string[]
	externalDependencies: string[]
}
