/**
 * Summary Quality Evaluator
 *
 * This module analyzes the quality of Jira issue summaries against best practices criteria.
 * It uses validators to check summary length, vague terminology, and actionable verbs.
 * The comprehensive evaluation helps teams create more effective issue titles that clearly
 * communicate intent and scope. Better summaries improve issue findability, reduce confusion,
 * and facilitate more efficient triage and prioritization processes.
 */
import { MESSAGES } from './constants/summaryValidationConstants'
import { validateActionableVerb, validateLength, validateNotVague } from './validators/summaryValidators'
import type { ValidationResult } from './validators/summaryValidators'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Runs all validators in sequence and returns the first failed validation or success
 * @param summary The summary to validate
 * @param validators Array of validation functions to run
 * @returns The result of the first failed validation or success
 */
export function runValidators(
	summary: string,
	validators: Array<(summary: string) => ValidationResult>,
): ValidationResult {
	for (const validator of validators) {
		const result = validator(summary)
		if (!result.isValid) {
			return result
		}
	}
	return { isValid: true, message: MESSAGES.GOOD }
}

/**
 * Evaluates the quality of the issue summary
 * @param issue The Jira issue to analyze
 * @returns Quality assessment message
 */
export function evaluateSummaryQuality(issue: JiraIssue): string {
	const summary = issue.fields.summary

	// Define the validators to run in sequence
	const validators = [validateLength, validateNotVague, validateActionableVerb]

	// Run all validators and get the result
	const result = runValidators(summary, validators)

	// Return the message string to maintain the original interface
	return result.message
}
