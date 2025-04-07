/**
 * Unit Tests for prompts/list Handler
 *
 * Tests the functionality of the handleListPrompts function,
 * ensuring it correctly retrieves and formats the list of available
 * prompt definitions from the registry.
 */

import { handleListPrompts } from '../list.handler'
import { createBasicIssuePrompt } from '../../definitions/createBasicIssue.prompt'

// Mock the RequestHandlerExtraPlaceholder as it's required by the signature but unused
const mockExtra = {
	signal: new AbortController().signal,
	sessionId: 'test-session',
}

describe('handleListPrompts', () => {
	it('should return the list of available prompt definitions', async () => {
		// Arrange: No arrangement needed as it uses the actual registry

		// Act: Call the handler
		const response = await handleListPrompts(undefined, mockExtra)

		// Assert: Check the response structure and content
		expect(response).toBeDefined()
		expect(response.prompts).toBeInstanceOf(Array)
		expect(response.prompts.length).toBeGreaterThan(0)

		// Find our specific prompt definition (excluding the getMessages function)
		const expectedPromptDefinition = {
			name: createBasicIssuePrompt.name,
			description: createBasicIssuePrompt.description,
			arguments: createBasicIssuePrompt.arguments,
		}

		expect(response.prompts).toContainEqual(expectedPromptDefinition)
	})

	// Add more tests if there were multiple prompts or edge cases
})
