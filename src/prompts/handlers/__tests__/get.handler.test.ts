/**
 * Unit Tests for prompts/get Handler
 *
 * Tests the functionality of the handleGetPrompt function,
 * ensuring it correctly finds prompts, validates arguments,
 * generates messages, and handles errors.
 */

import type { GetPromptRequest } from '@modelcontextprotocol/sdk/types.js'
import { handleGetPrompt } from '../get.handler'

// Mock the RequestHandlerExtraPlaceholder
const mockExtra = {
	signal: new AbortController().signal,
	sessionId: 'test-session',
}

// Helper to create mock GetPromptRequest objects
function createMockRequest(name: string, args?: Record<string, unknown>): GetPromptRequest {
	return {
		method: 'prompts/get', // Method property might be needed depending on exact type
		params: {
			name,
			arguments: args,
		},
	} as GetPromptRequest // Use assertion if exact type structure is complex
}

describe('handleGetPrompt', () => {
	it('should return messages for a valid prompt and arguments', async () => {
		// Arrange
		const request = createMockRequest('create-basic-issue', {
			projectKey: 'TEST',
			summary: 'Test Summary',
			description: 'Test Description',
		})
		const expectedText = `Create Jira issue in project TEST:\nSummary: Test Summary\nDescription: Test Description`

		// Act
		const response = await handleGetPrompt(request, mockExtra)

		// Assert
		expect(response).toBeDefined()
		expect(response.messages).toBeInstanceOf(Array)
		expect(response.messages.length).toBe(1)
		expect(response.messages[0].role).toBe('user')
		expect(response.messages[0].content.type).toBe('text')
		expect(response.messages[0].content.text).toBe(expectedText)
	})

	it('should return messages with default description if not provided', async () => {
		// Arrange
		const request = createMockRequest('create-basic-issue', {
			projectKey: 'PROJ',
			summary: 'Another Summary',
		})
		const expectedText = `Create Jira issue in project PROJ:\nSummary: Another Summary\nDescription: `

		// Act
		const response = await handleGetPrompt(request, mockExtra)

		// Assert
		expect(response.messages[0].content.text).toBe(expectedText)
	})

	it('should throw an error if the prompt name does not exist', async () => {
		// Arrange
		const request = createMockRequest('non-existent-prompt', {})

		// Act & Assert
		await expect(handleGetPrompt(request, mockExtra)).rejects.toThrow('Prompt not found: non-existent-prompt')
	})

	it('should throw an error if required arguments are missing', async () => {
		// Arrange: Missing 'summary'
		const request = createMockRequest('create-basic-issue', {
			projectKey: 'MISS',
		})

		// Act & Assert
		// The error should now come from the explicit validation step in the handler
		await expect(handleGetPrompt(request, mockExtra)).rejects.toThrow(
			"Missing required argument: 'summary'", // Error from validateRequiredArguments
		)
	})

	// Add tests for other prompts or more complex argument validation if needed
})
