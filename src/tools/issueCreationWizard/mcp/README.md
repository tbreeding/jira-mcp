# Issue Creation Wizard MCP Tools

This directory contains the MCP tool definitions and executors for the Jira Issue Creation Wizard.

## Import Guidelines

When using these tools, import the specific tools directly from their respective files:

```typescript
// CORRECT: Import tools directly from their source files
import { getStateWizardTool } from './toolDefinitions'
import { getStateWizardToolExecutor } from './getStateExecutor'
import { getStatusWizardToolExecutor } from './getStatusExecutor'
import { resetStateWizardToolExecutor } from './resetStateExecutor'
import { updateStateWizardToolExecutor } from './updateStateExecutor'
import { createIssueWizardToolExecutor } from './createIssueExecutor'

// INCORRECT: Do not create barrel files (index.ts) that re-export these tools
// This creates hard-to-track dependencies and adds complexity without value
```

## Available Tools

- **getStateWizardTool** - Get the current state of the issue creation wizard 
- **getStatusWizardTool** - Get status information about the issue creation wizard
- **resetStateWizardTool** - Reset the issue creation wizard state
- **updateStateWizardTool** - Update the state of the issue creation wizard
- **createIssueWizardTool** - Create a Jira issue using the current wizard state

## Tool Executors

Each tool has a corresponding executor function that implements the tool's functionality:

- **getStateWizardToolExecutor** - Executor for getState
- **getStatusWizardToolExecutor** - Executor for getStatus
- **resetStateWizardToolExecutor** - Executor for resetState
- **updateStateWizardToolExecutor** - Executor for updateState
- **createIssueWizardToolExecutor** - Executor for createIssue 