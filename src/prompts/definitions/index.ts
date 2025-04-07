/**
 * Index for Prompt Definitions
 *
 * Exports all defined MCP prompt configurations from this directory.
 * This allows the prompt registry and handlers to easily import all available
 * prompts from a single point.
 */

import { createBasicIssuePrompt } from './createBasicIssue.prompt'
import type { McpPrompt } from './prompt.types'

export const allPrompts: McpPrompt[] = [createBasicIssuePrompt]
