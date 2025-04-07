# User Confirmation and Analysis Checks for Issue Creation

> **Implementation Status**: Steps 1-5 have been completed. The WizardState interface has been updated, the Issue Creation Executor has been modified, the State Management Operations have been created with options objects instead of boolean parameters, the Tool Executors have been implemented, and the tools have been registered with the MCP server.

## Overview

This document outlines the implementation steps for adding safety checks to the Jira issue creation process:

1. A requirement for explicit user confirmation before creating an issue
2. A requirement for issue analysis to be completed before creation
3. Error handling for both requirements

These changes will prevent issues from being created without user consent and ensure proper analysis has been performed, providing a more controlled and deliberate issue creation workflow.

## Implementation Plan

### 1. Update the WizardState Interface

Add fields to track user confirmation and analysis completion status.

**File**: `src/tools/issueCreationWizard/types.ts`

```typescript
export interface WizardState {
	active: boolean
	currentStep: WizardStep
	projectKey?: string
	issueTypeId?: string
	fields: Record<string, unknown>
	validation: {
		errors: Record<string, string[]>
		warnings: Record<string, string[]>
	}
	analysis?: {
		metadata?: CategorizedFields
		complexity?: Record<string, unknown>
		completeness?: Record<string, unknown>
	}
	timestamp: number
	// Add these new fields:
	userConfirmation?: boolean // Whether user has explicitly approved issue creation
	analysisComplete?: boolean // Whether analysis has been completed
}
```

### 2. Modify the Issue Creation Executor

Add checks for user confirmation and analysis completion directly in the executeIssueCreation function.

**File**: `src/tools/issueCreationWizard/mcp/createIssueExecutor.ts`

```typescript
async function executeIssueCreation(
	stateManager: StateManager,
	jiraConfig: JiraApiConfig,
): Promise<ReturnType<typeof createSuccessResult | typeof createErrorResult>> {
	log(`executeIssueCreation: Creating issue from wizard state`)
	try {
		// 1. Get and Validate State
		log(`Getting current wizard state`)
		const stateResult = stateManager.getState()
		const validationResult = validateWizardState(stateResult)

		if (!validationResult.success) {
			return validationResult.errorResult
		}
		const currentState = validationResult.data

		// NEW: Check if analysis is complete
		if (!currentState.analysisComplete) {
			log('ERROR: Issue analysis not completed')
			return createErrorResult('Issue analysis must be completed before creating the issue. Please run analysis first.')
		}

		// NEW: Check for user confirmation
		if (!currentState.userConfirmation) {
			log('ERROR: User confirmation not obtained')
			return createErrorResult(
				"User confirmation is required before creating the issue. Please ask the user if it's OK to proceed.",
			)
		}

		// 2. Prepare Payload
		const issueData = prepareIssuePayload(currentState)

		// 3. Create Issue via API
		log(`Calling Jira API via createIssue for project ${currentState.projectKey}`)
		const apiResult = await createIssue(jiraConfig, issueData)

		// 4. Handle API Response
		return handleApiResponse(apiResult, issueData, jiraConfig)
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		const stackTrace = error instanceof Error ? error.stack : 'No stack trace available'
		log(`ERROR in executeIssueCreation: ${errorMessage}`)
		log(`ERROR stack trace: ${stackTrace}`)
		return createErrorResult(`Unexpected error during issue creation: ${errorMessage}`)
	}
}
```

### 3. Create State Management Operations

Add operations to set the userConfirmation and analysisComplete flags.

**File**: `src/tools/issueCreationWizard/operations/setConfirmationFlags.ts` (new file)

```typescript
/**
 * Operations for setting user confirmation and analysis completion flags
 *
 * This module provides functions to update the userConfirmation and analysisComplete
 * flags in the wizard state.
 */

import { createErrorResult, createSuccessResult } from '../mcp/utils'
import type { StateManager } from '../stateManager'

/**
 * Options for the setAnalysisComplete function
 */
export interface AnalysisCompleteOptions {
	isComplete: boolean
}

/**
 * Set the analysis complete flag in the wizard state
 */
export function setAnalysisComplete(
	stateManager: StateManager,
	options: AnalysisCompleteOptions,
): ReturnType<typeof createSuccessResult | typeof createErrorResult> {
	try {
		const stateResult = stateManager.getState()
		if (!stateResult.success) {
			return createErrorResult('No active wizard session found')
		}

		// We only need to check if state exists, not use it
		const updatedState = {
			analysisComplete: options.isComplete,
		}

		const setResult = stateManager.updateState(updatedState)
		if (!setResult.success) {
			return createErrorResult(`Failed to update state: ${setResult.error.message}`)
		}

		return createSuccessResult({
			message: `Analysis status updated to: ${options.isComplete}`,
		})
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		return createErrorResult(`Failed to update analysis status: ${errorMessage}`)
	}
}

/**
 * Options for the setUserConfirmation function
 */
export interface UserConfirmationOptions {
	confirmed: boolean
}

/**
 * Set the user confirmation flag in the wizard state
 */
export function setUserConfirmation(
	stateManager: StateManager,
	options: UserConfirmationOptions,
): ReturnType<typeof createSuccessResult | typeof createErrorResult> {
	try {
		const stateResult = stateManager.getState()
		if (!stateResult.success) {
			return createErrorResult('No active wizard session found')
		}

		// We only need to check if state exists, not use it
		const updatedState = {
			userConfirmation: options.confirmed,
		}

		const setResult = stateManager.updateState(updatedState)
		if (!setResult.success) {
			return createErrorResult(`Failed to update state: ${setResult.error.message}`)
		}

		return createSuccessResult({
			message: `User confirmation updated to: ${options.confirmed}`,
		})
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		return createErrorResult(`Failed to update user confirmation: ${errorMessage}`)
	}
}
```

### 4. Create MCP Tool Executors

Create tool executors for the new operations.

**File**: `src/tools/issueCreationWizard/mcp/setAnalysisCompleteExecutor.ts` (new file)

```typescript
/**
 * MCP Tool Executor for setting the analysis complete flag
 *
 * This module implements the tool executor for setting the analysis complete flag.
 */

import { setAnalysisComplete, type AnalysisCompleteOptions } from '../operations/setConfirmationFlags'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Factory function to create an executor for setting the analysis complete flag
 */
export function setAnalysisCompleteExecutor(stateManager: StateManager): ToolExecutor {
	return async (parameters) => {
		const options: AnalysisCompleteOptions = {
			isComplete: parameters.arguments.isComplete as boolean,
		}
		
		// The operation function already returns a properly formatted ToolResult
		return setAnalysisComplete(stateManager, options)
	}
}
```

**File**: `src/tools/issueCreationWizard/mcp/setUserConfirmationExecutor.ts` (new file)

```typescript
/**
 * MCP Tool Executor for setting the user confirmation flag
 *
 * This module implements the tool executor for setting the user confirmation flag.
 */

import { setUserConfirmation, type UserConfirmationOptions } from '../operations/setConfirmationFlags'
import type { ToolExecutor } from '../../../types'
import type { StateManager } from '../stateManager'

/**
 * Factory function to create an executor for setting the user confirmation flag
 */
export function setUserConfirmationExecutor(stateManager: StateManager): ToolExecutor {
	return async (parameters) => {
		const options: UserConfirmationOptions = {
			confirmed: parameters.arguments.confirmed as boolean,
		}
		
		// The operation function already returns a properly formatted ToolResult
		return setUserConfirmation(stateManager, options)
	}
}
```

### 5. Register Tools in the MCP Server

Update the MCP tool registration to include the new tools.

**File**: `src/tools/issueCreationWizard/mcp/registerTools.ts` (location may vary)

Add these tools to the registration function:

```typescript
import { setAnalysisCompleteExecutor } from './setAnalysisCompleteExecutor'
import { setUserConfirmationExecutor } from './setUserConfirmationExecutor'

// Add these to the existing tool registrations:
mcp.registerTool('mcp_IssueCreationWizard_setAnalysisComplete', setAnalysisCompleteExecutor(stateManager), {
	description: 'Sets the analysis complete flag for the current issue creation session',
	parameters: [
		{
			name: 'isComplete',
			type: 'boolean',
			required: true,
			description: 'Whether analysis is complete',
		},
	],
})

mcp.registerTool('mcp_IssueCreationWizard_setUserConfirmation', setUserConfirmationExecutor(stateManager), {
	description: 'Sets the user confirmation flag for the current issue creation session',
	parameters: [
		{
			name: 'confirmed',
			type: 'boolean',
			required: true,
			description: 'Whether the user has confirmed issue creation',
		},
	],
})
```

### 6. Update Issue Analysis Process

Modify the issue analysis process to set the analysisComplete flag when analysis is done.

**File**: Location of issue analysis implementation (might be in multiple files)

Add code to set the analysisComplete flag after successful analysis:

```typescript
// After successful analysis
const setAnalysisResult = setAnalysisComplete(stateManager, true)
if (!setAnalysisResult.success) {
	log(`Warning: Failed to set analysis complete flag: ${setAnalysisResult.error.message}`)
}
```

### 7. Add Tests

Create unit tests for the new functionality.

**File**: `src/tools/issueCreationWizard/__tests__/setConfirmationFlags.test.ts` (new file)

```typescript
import { setAnalysisComplete, setUserConfirmation } from '../operations/setConfirmationFlags'
import { createMockStateManager } from './testUtils'

describe('setConfirmationFlags', () => {
	describe('setAnalysisComplete', () => {
		test('should set analysis complete flag to true by default', () => {
			const mockStateManager = createMockStateManager({
				active: true,
				currentStep: 'field_completion',
				fields: {},
				validation: { errors: {}, warnings: {} },
				timestamp: Date.now(),
			})

			const result = setAnalysisComplete(mockStateManager)

			expect(result.success).toBe(true)
			expect(mockStateManager.setState).toHaveBeenCalledWith(
				expect.objectContaining({
					analysisComplete: true,
				}),
			)
		})

		// Add more tests...
	})

	describe('setUserConfirmation', () => {
		test('should set user confirmation flag to true by default', () => {
			const mockStateManager = createMockStateManager({
				active: true,
				currentStep: 'field_completion',
				fields: {},
				validation: { errors: {}, warnings: {} },
				timestamp: Date.now(),
			})

			const result = setUserConfirmation(mockStateManager)

			expect(result.success).toBe(true)
			expect(mockStateManager.setState).toHaveBeenCalledWith(
				expect.objectContaining({
					userConfirmation: true,
				}),
			)
		})

		// Add more tests...
	})
})
```

**File**: `src/tools/issueCreationWizard/mcp/__tests__/createIssueExecutor.test.ts` (update existing file)

Add tests for the new validation checks:

```typescript
test('should return error if analysis is not complete', async () => {
	// Setup with analysisComplete = false
	const mockStateManager = createMockStateManager({
		active: true,
		currentStep: 'field_completion',
		projectKey: 'TEST',
		issueTypeId: '10000',
		fields: { summary: 'Test Issue' },
		validation: { errors: {}, warnings: {} },
		timestamp: Date.now(),
		analysisComplete: false,
		userConfirmation: true,
	})

	const result = await executeIssueCreation(mockStateManager, mockJiraConfig)

	expect(result.success).toBe(false)
	expect(result.error.message).toContain('analysis must be completed')
})

test('should return error if user confirmation is not obtained', async () => {
	// Setup with userConfirmation = false
	const mockStateManager = createMockStateManager({
		active: true,
		currentStep: 'field_completion',
		projectKey: 'TEST',
		issueTypeId: '10000',
		fields: { summary: 'Test Issue' },
		validation: { errors: {}, warnings: {} },
		timestamp: Date.now(),
		analysisComplete: true,
		userConfirmation: false,
	})

	const result = await executeIssueCreation(mockStateManager, mockJiraConfig)

	expect(result.success).toBe(false)
	expect(result.error.message).toContain('User confirmation is required')
})
```

### 8. Update AI Assistant Instructions

Modify the AI assistant instructions to ensure it follows the new workflow requirements.

1. After completing issue field population:

   - Run issue analysis
   - Verify the analysis is complete
   - Set the analysisComplete flag

2. Before creating the issue:
   - Explicitly ask the user for permission to create the issue
   - Set the userConfirmation flag based on the user's response
   - Only then call the createIssue endpoint

## Usage Example

Here's a simplified example of how the AI assistant should use these tools:

```
// After collecting all issue fields
AI: "I'll now analyze the issue to ensure it's properly configured."

// Call analysis tool
// After successful analysis:
AI calls: mcp_IssueCreationWizard_setAnalysisComplete({ isComplete: true })

// Then ask for confirmation
AI: "I've prepared the issue with the following details:
Summary: {summary}
Description: {description}
...

Would you like me to create this issue now?"

// If user says yes:
AI calls: mcp_IssueCreationWizard_setUserConfirmation({ confirmed: true })
AI calls: mcp_IssueCreationWizard_createIssue()

// If user says no:
AI calls: mcp_IssueCreationWizard_setUserConfirmation({ confirmed: false })
AI: "I understand. The issue won't be created. Let me know if you'd like to make any changes."
```

## Testing Plan

1. **Unit Testing**: Add tests as described in section 7.

2. **Integration Testing**:

   - Test the full issue creation flow with both flags set correctly
   - Test error cases when analysis is not complete
   - Test error cases when user confirmation is not provided
   - Test the AI assistant's behavior with the new workflow

3. **Manual Testing**:
   - Verify that the AI assistant correctly follows the workflow
   - Verify error messages are clear and actionable
   - Verify that issues cannot be created without explicit confirmation

## Implementation Checklist

- [x] Update WizardState interface
- [x] Modify executeIssueCreation function
- [x] Create setConfirmationFlags operations
- [x] Create tool executors
- [x] Register new tools
- [ ] Update issue analysis process
- [ ] Add unit tests
- [ ] Update AI assistant instructions
- [ ] Perform integration testing
- [ ] Perform manual testing
