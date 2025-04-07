/**
 * Completeness Evaluation Module for Jira Issues
 *
 * This file provides functionality to evaluate the completeness of a Jira issue.
 * It analyzes various aspects of the issue including requirements, specifications,
 * and other necessary components to determine how well-defined and complete the issue is.
 * The evaluation helps in identifying gaps in issue documentation and assists teams
 * in improving the quality of their requirements and specifications.
 */
import { calculateCompletenessScore } from './calculateCompletenessScore'
import { checkAcceptanceCriteria } from './checkAcceptanceCriteria'
import { checkDependencies } from './checkDependencies'
import { checkDesignSpecifications } from './checkDesignSpecifications'
import { checkTechnicalConstraints } from './checkTechnicalConstraints'
import { checkTestingRequirements } from './checkTestingRequirements'
import { checkUserImpact } from './checkUserImpact'
import { extractRelevantText } from './extractRelevantText'
import { generateSuggestions } from './generateSuggestions'
import { getInternalContextualRequirements } from './utils/getInternalContextualRequirements'
import type { CompletenessEvaluation, CategoryCheckResult } from './completenessEvaluation.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Evaluates the completeness of a Jira issue's documentation
 * based on agile principles and the issue's context
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @returns Completeness evaluation with score, missing information, and suggestions
 */
export function getCompletenessEvaluation(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
): CompletenessEvaluation {
	// Extract all relevant text from the issue
	const allText = extractRelevantText(issue, commentsResponse)

	// Determine what information categories are relevant for this issue type and context
	const contextualRequirements = getInternalContextualRequirements(issue)

	// Check for each information category
	const acceptanceCriteriaResult = checkAcceptanceCriteria(allText, issue)

	// Only check categories relevant to this issue's context
	const technicalConstraintsResult: CategoryCheckResult = contextualRequirements.needsTechnicalConstraints
		? checkTechnicalConstraints(allText)
		: { missing: [], present: true, quality: 'complete' }

	const dependenciesResult = checkDependencies(allText, issue)

	const testingRequirementsResult: CategoryCheckResult = contextualRequirements.needsTestingRequirements
		? checkTestingRequirements(allText)
		: { missing: [], present: true, quality: 'complete' }

	const designSpecificationsResult: CategoryCheckResult = contextualRequirements.needsDesignSpecifications
		? checkDesignSpecifications(allText, issue)
		: { missing: [], present: true, quality: 'complete' }

	const userImpactResult: CategoryCheckResult = contextualRequirements.needsUserImpact
		? checkUserImpact(allText)
		: { missing: [], present: true, quality: 'complete' }

	// Combine missing information for relevant categories only
	const missingInformation = [
		...acceptanceCriteriaResult.missing,
		...technicalConstraintsResult.missing,
		...dependenciesResult.missing,
		...testingRequirementsResult.missing,
		...designSpecificationsResult.missing,
		...userImpactResult.missing,
	]

	// Calculate score based on context-aware requirements
	const score = calculateCompletenessScore(
		acceptanceCriteriaResult,
		technicalConstraintsResult,
		dependenciesResult,
		testingRequirementsResult,
		designSpecificationsResult,
		userImpactResult,
		issue.fields.issuetype.name,
		contextualRequirements,
	)

	// Generate context-aware suggestions
	const suggestions = generateSuggestions(missingInformation, issue.fields.issuetype.name, contextualRequirements)

	return {
		score,
		missingInformation,
		suggestions,
	}
}
