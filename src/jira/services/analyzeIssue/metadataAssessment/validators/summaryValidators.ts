/**
 * Summary Validators
 *
 * This module provides validation functions for Jira issue summaries.
 * It includes validators for length, vagueness, and actionability.
 * Each validator returns a structured result that indicates if the
 * validation passed and provides an appropriate message.
 */
import { ACTION_VERBS, LENGTH_THRESHOLDS, MESSAGES, VAGUE_TERMS } from '../constants/summaryValidationConstants'

/**
 * Defines the structure of a validation result
 */
export type ValidationResult = {
	isValid: boolean
	message: string
}

/**
 * Validates if the summary has sufficient length
 * @param summary The summary to validate
 * @returns Validation result object
 */
export function validateLength(summary: string): ValidationResult {
	if (summary.length < LENGTH_THRESHOLDS.MIN_SUMMARY_LENGTH) {
		return { isValid: false, message: MESSAGES.TOO_SHORT }
	}
	if (summary.length > LENGTH_THRESHOLDS.MAX_SUMMARY_LENGTH) {
		return { isValid: false, message: MESSAGES.TOO_LONG }
	}
	return { isValid: true, message: '' }
}

/**
 * Validates if the summary avoids vague terms
 * @param summary The summary to validate
 * @param vagueTerms Optional list of vague terms to check against
 * @returns Validation result object
 */
export function validateNotVague(summary: string, vagueTerms = VAGUE_TERMS): ValidationResult {
	if (vagueTerms.some((term) => summary.toLowerCase() === term)) {
		return { isValid: false, message: MESSAGES.TOO_VAGUE }
	}
	return { isValid: true, message: '' }
}

/**
 * Validates if the summary contains an actionable verb
 * @param summary The summary to validate
 * @param actionVerbs Optional list of action verbs to check against
 * @returns Validation result object
 */
export function validateActionableVerb(summary: string, actionVerbs = ACTION_VERBS): ValidationResult {
	// Pre-compile regex pattern for better performance
	const hasActionVerb = actionVerbs.some((verb) => {
		const pattern = new RegExp(`\\b${verb}\\b`, 'i')
		return pattern.test(summary)
	})

	if (!hasActionVerb) {
		return { isValid: false, message: MESSAGES.NOT_ACTIONABLE }
	}
	return { isValid: true, message: '' }
}
