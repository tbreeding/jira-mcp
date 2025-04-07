# Implementation Steps for Creating a Jira JQL Query Tool

## Overview
This document outlines the implementation steps for creating a new tool to retrieve Jira issues using JQL (Jira Query Language) queries. The implementation will follow the existing patterns in the codebase, focusing on modular design, proper error handling, and clean functional programming principles.

## Step 1: Create a JQL Search API Function
- Create a new file `src/jira/api/searchIssuesByJql.ts`
- Implement a function that calls the Jira API search endpoint with a JQL query
- Function signature: `searchIssuesByJql(jqlQuery: string, config: JiraApiConfig): Promise<Try<JiraIssue[]>>`
- Use `callJiraApi` with `RestMethod.GET` to make the request to `/rest/api/3/search?jql={encodedJql}`
- URL-encode the JQL query parameter for proper transmission
- Implement proper error handling using the Success/Failure pattern
- Extract the issues array from the search response and return it

## Step 2: Define Types for Search Results
- Review existing types in `src/jira/types/issue.types.ts`
- Create or extend types to represent the search response structure
- The search endpoint returns a different structure than a single issue call:
  ```typescript
  interface JiraSearchResponse {
    startAt: number;
    maxResults: number;
    total: number;
    issues: JiraIssue[];
  }
  ```
- Ensure proper typing for pagination parameters and the array of issues
- Return the complete pagination metadata in the response to allow for efficient pagination

## Step 3: Create a Tool Definition
- Create a file `src/tools/jira/utils/jqlToolDefinitions.ts`
- Define the schema for the JQL search tool parameters:
  - Required `jql` parameter for the query string
  - Optional pagination parameters (startAt, maxResults)
- Include validation rules for the JQL parameter
- Document pagination parameters clearly to help consumers understand pagination capabilities
- Follow the pattern in existing tool definitions

## Step 4: Create a Tool Executor
- Create a file `src/tools/jira/utils/jqlToolExecutor.ts`
- Implement the executor function that:
  - Accepts tool parameters and Jira configuration
  - Calls the API function with proper parameters
  - Handles errors appropriately
  - Returns results in the expected format
  - Include complete pagination metadata in the response
- Follow the existing pattern for tool executors

## Step 5: Create a Facade Module
- Create `src/tools/jira/getIssuesByJql.ts`
- Combine tool definition and executor in a clean facade
- Export the tool definition for documentation/schema purposes
- Export a function to create the configured executor
- Maintain clean separation of concerns
- Follow the pattern in `getIssue.ts` in the tools folder

## Step 6: Implement Tool Execution Logic
- Create `src/tools/jira/executeGetIssuesByJqlTool.ts`
- Implement the core execution logic:
  - Extract parameters from the tool call
  - Validate parameters
  - Call the API function
  - Format results for return, including pagination metadata
  - Handle errors at each step
- Structure the response to include:
  - The array of issues
  - Pagination metadata (total, startAt, maxResults)
  - A flag or indicator if more results are available
  - Information to help construct the next page request
- Follow the pattern in `executeAnalyzeIssueTool.ts`

## Step 7: Register and Export the Tool
- Add the new tool to the appropriate registry or index
- Ensure the tool is properly exported and available
- Update any documentation or help text as needed
- Consider adding tests in a `__tests__` directory

## Enhanced Pagination Support
- Return the total count of issues matching the query from the Jira API response
- Include pagination metadata in the tool response to allow agents to track state
- Provide a clear indication of whether more results are available
- Structure the response to make it easy for agents to request the next page
- Consider including helpful utilities like:
  - hasNextPage: boolean flag indicating more results exist
  - hasPreviousPage: boolean flag indicating previous results exist
  - nextPageStartAt: The startAt value to use when requesting the next page
  - previousPageStartAt: The startAt value to use when requesting the previous page

## Error Handling Guidelines
- Use the Success/Failure pattern consistently
- Handle network errors, authentication errors, and Jira API errors
- Provide meaningful error messages
- Log errors appropriately using the existing logger

## Coding Standards
- Follow existing code structure and patterns
- Use standard function declarations, not arrow functions
- Maintain immutability where possible
- Keep functions small and focused
- Use proper JSDoc comments for documentation 