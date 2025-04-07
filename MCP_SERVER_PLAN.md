# Jira MCP Server Implementation Plan

## Overall Architecture

The MCP server will follow these architectural principles:
- Feature-based folder structure
- Clear separation of concerns
- Functional programming approach
- Proper error handling using object patterns (not exceptions)
- Comprehensive testing

## File Structure

```
jira-mcp/
├── src/
│   ├── index.ts                  # Main entry point
│   ├── config/                   # Configuration 
│   │   └── config.ts             # Environment and app configuration
│   ├── types/                    # Global type definitions
│   │   └── index.type.ts         # Exports all types
│   │   └── jira.type.ts          # Jira-related types
│   │   └── error.type.ts         # Error-related types
│   ├── utils/                    # Shared utilities
│   │   └── logger.ts             # Logging utility (pino)
│   │   └── error.ts              # Error handling utilities
│   ├── services/                 # Core business logic
│   │   ├── jira/                 # Jira related functionality
│   │   │   ├── types/            # Jira service specific types
│   │   │   ├── client.ts         # Jira API client
│   │   │   ├── issue.ts          # Issue-related functions
│   │   │   └── index.ts          # Service exports
│   │   └── mcp/                  # MCP related functionality
│   │       ├── types/            # MCP service specific types
│   │       ├── handlers.ts       # MCP command handlers
│   │       └── index.ts          # Service exports
│   └── api/                      # API layer (if needed)
│       └── routes.ts             # API route definitions
├── test/                         # Test files mirroring src structure
│   ├── unit/                     # Unit tests
│   └── integration/              # Integration tests
├── .env                          # Environment variables
└── package.json                  # Dependencies and scripts
```

## Implementation Steps

### Phase 1: Project Setup

1. **Initialize Project Structure**
   - Create basic directory structure
   - Set up package.json with essential dependencies
   - Configure TypeScript
   - Verify project structure works

2. **Setup Logging**
   - Implement pino logger in utils/logger.ts
   - Add different log levels
   - Test logger functionality
   - Verify MCP still works

3. **Configuration System**
   - Create config module to load environment variables
   - Add type definitions for configuration
   - Implement validation for configuration
   - Verify MCP still works

### Phase 2: Core Infrastructure

4. **Error Handling Pattern**
   - Define error types in types/error.type.ts
   - Implement Result type pattern for function returns
   - Create utility functions for error creation and handling
   - Write tests for error utilities
   - Verify MCP still works

5. **Jira Types**
   - Define Jira-related types (Issue, Project, etc.)
   - Create proper type organization
   - Write documentation for types
   - Verify MCP still works

### Phase 3: Jira Integration

6. **Jira Client Implementation**
   - Create basic authenticated Jira API client
   - Implement request/response handling
   - Add proper error handling
   - Write tests for client
   - Verify MCP still works

7. **Get Issue by Key Feature**
   - Implement function to fetch a single issue by key
   - Add parameter validation
   - Implement proper error handling
   - Write unit tests
   - Verify MCP still works

### Phase 4: MCP Integration

8. **MCP Handler for Issue Lookup**
   - Create MCP handler for issue lookup command
   - Connect handler to Jira service
   - Implement response formatting
   - Write tests for the handler
   - Verify MCP works with new command

9. **Documentation and Usage Examples**
   - Document the new feature
   - Create usage examples
   - Update README
   - Verify documentation is clear

## Design Principles

### Testability
- Pure functions with explicit dependencies
- No side effects within business logic
- Dependency injection through function parameters
- Clear input/output contracts for all functions

### Error Handling
- All functions will return a Result object: `{ success: true, data: result }` or `{ success: false, error: errorObject }`
- Structured error objects with codes, messages, and metadata
- No exceptions for control flow

### Function Style
- Use standard function declarations, not arrow functions
- Function composition for complex operations
- Named parameters for clarity
- Early returns to avoid nesting

## Example Implementation for Issue Lookup

```typescript
// Example of how the getIssueByKey function might be implemented
function getIssueByKey(
  client: JiraClient, 
  params: { issueKey: string }
): Promise<Result<JiraIssue, JiraError>> {
  // Parameter validation
  if (!params.issueKey) {
    return Promise.resolve({
      success: false,
      error: createJiraError({
        code: 'INVALID_PARAMETER',
        message: 'Issue key is required',
      })
    });
  }

  // Make API call
  return client.request({
    method: 'GET',
    path: `/rest/api/2/issue/${params.issueKey}`,
  })
  .then(function(response) {
    return {
      success: true,
      data: response.data
    };
  })
  .catch(function(error) {
    return {
      success: false,
      error: createJiraError({
        code: 'JIRA_API_ERROR',
        message: `Failed to fetch issue ${params.issueKey}`,
        originalError: error
      })
    };
  });
}
```

Each step in this plan can be implemented and verified independently, ensuring that we maintain a working MCP server throughout the development process.
