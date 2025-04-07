/**
 * Analyze Issue Wizard Tool Executor
 *
 * This module implements the execution function for the analyzeIssue tool.
 * It provides specific analysis of the issue being created via the wizard.
 */

import { WizardStep } from '../types'
import { createSuccessResult, createErrorResult } from './utils'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Factory function to create an executor for analyzing the issue in the wizard
 */
export function analyzeIssueWizardToolExecutor(stateManager: StateManager): ToolExecutor {
	return async function (): Promise<ReturnType<typeof createSuccessResult>> {
		try {
			const result = stateManager.getState()

			if (!result.success) {
				return createErrorResult(result.error.message)
			}
			const { data } = result
			if (![WizardStep.REVIEW, WizardStep.SUBMISSION, WizardStep.FIELD_COMPLETION].includes(data.currentStep)) {
				return createErrorResult(
					`Analysis is not allowed at this step. 
                    Please complete 
                        Project Selection, 
                        Issue Type Selection, 
                        Field Completion, 
                        Field Review`,
				)
			}

			return createSuccessResult({
				success: true,
				prompt: `You are a senior Agile coach with expertise in issue quality analysis. Critically analyze this Jira issue for quality and adherence to Agile/Scrum best practices.

IMPORTANT: This analysis occurs at issue CREATION time - before team refinement or planning. Do NOT criticize missing Sprint, Story Points, or Assignee fields, as these are typically assigned during team ceremonies.

For each aspect below, provide a critical assessment:

1. Title: Is it clear, specific, concise, and focused on a single deliverable? Does it avoid generic terms like "handle" or "manage"?

2. Description: Does it clearly articulate the business value? Is it free of implementation details? Does it provide adequate context for developers?

3. Acceptance Criteria: Are they specific, measurable, and testable? Do they define "done" explicitly? Are they written in a consistent format?

4. User Story Format: If applicable, does it follow "As a [user], I want [function], so that [value]" format? Does it identify the real end user and true value?

5. Scope Boundaries: Is the scope precisely defined? Are there potential scope creep risks?

6. Dependencies: Does it identify prerequisites, blockers, or other tickets it depends on?

7. Technical Debt Risk: Could this implementation create technical debt? Are there architectural concerns?

8. Testability: How easily can QA verify this issue? Are edge cases considered?

Provide your assessment in clear, direct language with specific suggestions for improvement. Be skeptical and cautious rather than optimistic. Your goal is to elevate issue quality before it enters the backlog.

Return your analysis in this format:
- Overall Quality: [Critical/Poor/Needs Improvement/Acceptable/Good]
- Key Concerns: [Bulleted list of major problems]
- Improvement Recommendations: [Specific, actionable suggestions]`,
				data: {
					projectKey: data.projectKey,
					issueTypeId: data.issueTypeId,
					fields: data.fields,
					validation: data.validation,
					analysis: data.analysis,
				},
			})
		} catch (error) {
			return createErrorResult((error as Error).message)
		}
	}
}
