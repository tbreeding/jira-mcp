# Jira API Payload Format Fix Implementation Guide

## Background

We've identified a critical issue with the Jira issue creation functionality in our MCP (Mission Control Panel). When attempting to create Jira issues, the API consistently returns a `400 Bad Request` error with `"Invalid request payload"`. After investigating the Jira REST API v3 documentation, we've found that our implementation doesn't match the expected payload format.

Key discrepancies:
- Missing required `update` object property in the request payload
- Improper formatting of text fields (not using Atlassian Document Format properly)
- Inconsistent handling of user references (reporter/assignee fields)

## Implementation Strategy

We'll modify the code that transforms the wizard state into an API request payload, ensuring it generates a format that matches Jira's expectations. The transformation will happen at the API boundary rather than in the wizard state itself, maintaining a clean separation of concerns.

## Detailed Implementation Steps

### 1. Update the `CreateIssueRequest` Interface

First, update the request interface in `src/jira/api/createIssue.ts` to include the required `update` property:

```typescript
/**
 * Interface for create issue request body
 */
interface CreateIssueRequest {
  fields: CreateIssueFields;
  update: Record<string, unknown>; // Required by Jira API even if empty
}
```

### 2. Create Field Transformation Functions

Add these utility functions to transform wizard state fields into Jira-compatible formats:

```typescript
/**
 * Transforms plain text descriptions into Atlassian Document Format
 * @param text The plain text to transform
 * @returns An ADF document object
 */
function convertToAdf(text: string): ADFDocument {
  return {
    content: [
      {
        content: [
          {
            text: text,
            type: "text"
          }
        ],
        type: "paragraph"
      }
    ],
    type: "doc",
    version: 1
  };
}

/**
 * Transforms fields from wizard format to Jira API format
 * @param fields The fields from wizard state
 * @returns Transformed fields ready for API submission
 */
function transformFields(fields: CreateIssueFields): CreateIssueFields {
  const result = { ...fields };
  
  // Convert description to ADF if it's a plain string
  if (typeof fields.description === 'string') {
    result.description = convertToAdf(fields.description);
  }
  
  // Transform reporter format if needed (ensuring it uses the correct format)
  if (fields.reporter && 'accountId' in fields.reporter) {
    // Keep as is - accountId format is supported
  } else if (fields.reporter && 'id' in fields.reporter) {
    // Keep as is - id format is supported
  } else if (fields.reporter && typeof fields.reporter === 'string') {
    // Convert string to id format
    result.reporter = { id: fields.reporter };
  }
  
  // Similar transformations for assignee if present
  // ...
  
  return result;
}
```

### 3. Implement Payload Construction Function

Add a function to construct the complete API payload:

```typescript
/**
 * Builds the complete create issue payload from fields
 * @param fields The issue fields to include
 * @returns A properly formatted Jira API request payload
 */
function buildCreateIssuePayload(fields: CreateIssueFields): CreateIssueRequest {
  return {
    fields: transformFields(fields),
    update: {} // Always include empty update object as required by Jira API
  };
}
```

### 4. Update Main createIssue Function

Modify the main `createIssue` function in `src/jira/api/createIssue.ts`:

```typescript
/**
 * Creates a new Jira issue
 * @param config Jira API configuration
 * @param fields Fields for the new issue
 * @returns A Promise that resolves to a Try containing the creation response or error
 */
export async function createIssue(config: JiraApiConfig, fields: CreateIssueFields): Promise<Try<CreateIssueResponse>> {
  // Validate required fields
  const validationError = validateCreateIssueFields(fields);
  if (validationError) {
    log(`ERROR: Invalid issue creation fields: ${validationError}`);
    return Promise.resolve(Failure(new Error(validationError)));
  }

  // Create properly formatted payload for Jira API
  const requestBody = buildCreateIssuePayload(fields);

  // Safe logging without exposing the entire payload
  log(`DEBUG: Creating issue for project ${fields.project.key} with type ${fields.issuetype.id}`);

  // Make the API call to create the issue
  const { error: callApiError, value } = await callJiraApi<CreateIssueResponse>({
    config,
    endpoint: '/rest/api/3/issue',
    method: RestMethod.POST,
    body: JSON.stringify(requestBody),
  });

  if (callApiError) {
    log(`ERROR: Failed to create issue: ${callApiError.message}`);
    return Failure(callApiError);
  }

  return Success(value);
}
```

### 5. Update Issue Creation Wizard

Modify the `createIssue` call in the issue creation wizard implementation (likely in `src/jira/wizard/issueCreationWizard.ts` or similar):

```typescript
/**
 * Creates a Jira issue using the current wizard state
 */
export async function createIssueFromWizardState(state: WizardState): Promise<Try<string>> {
  // Extract and validate fields from wizard state
  if (!state.active || !state.projectKey || !state.issueTypeId) {
    return Failure(new Error('Invalid wizard state'));
  }

  // Prepare fields for the create issue function
  const fields: CreateIssueFields = {
    summary: state.fields.summary as string,
    issuetype: { id: state.issueTypeId },
    project: { key: state.projectKey },
    ...extractRemainingFields(state.fields)
  };

  // Call the createIssue function with the prepared fields
  const result = await createIssue(getJiraConfig(), fields);
  
  if (result.error) {
    return Failure(result.error);
  }
  
  return Success(result.value.key);
}

/**
 * Helper to extract remaining fields from wizard state
 */
function extractRemainingFields(fields: Record<string, unknown>): Partial<CreateIssueFields> {
  const result: Partial<CreateIssueFields> = {};
  
  // Copy fields other than summary (which is handled separately)
  for (const [key, value] of Object.entries(fields)) {
    if (key !== 'summary') {
      result[key] = value;
    }
  }
  
  return result;
}
```

### 6. Add Debugging to Aid Troubleshooting

Add enhanced logging to help troubleshoot any remaining issues:

```typescript
// In the createIssue function, add this before making the API call:
log(`DEBUG: Submitting Jira issue creation with request structure: ${JSON.stringify({
  fields: Object.keys(requestBody.fields),
  update: Object.keys(requestBody.update || {})
})}`);
```

## Testing Plan

1. **Unit Tests**:
   - Add tests for the `transformFields` function to ensure it properly converts various input formats
   - Add tests for the `buildCreateIssuePayload` function to verify it creates payloads with correct structure
   - Update existing `createIssue` tests to account for the new payload format

2. **Integration Tests**:
   - Test the complete issue creation flow from wizard to API call
   - Verify successful creation of issues with different field combinations
   - Test edge cases (minimal fields, all fields, special characters, etc.)

3. **Manual Testing Checklist**:
   - Create an issue with minimal fields (summary only)
   - Create an issue with description (verify ADF formatting)
   - Create an issue with assignee and reporter fields
   - Create an issue with all possible fields populated

## Implementation Considerations

### Error Handling

Enhance error handling to provide more specific feedback for different failure scenarios:
- API connection issues
- Authentication/authorization failures
- Validation errors returned from the API
- Malformed payload errors

### Performance Impact

The transformation functions add minimal overhead since they only run once during submission, not during the interactive wizard experience.

### Backward Compatibility

The changes are isolated to the API boundary layer and don't affect the wizard state format, ensuring backward compatibility with existing code that interacts with the wizard state.

## Future Improvements

1. Add more specialized field formatters for other complex field types (e.g., custom fields, array fields)
2. Consider implementing a more comprehensive ADF builder for complex rich text content
3. Add option to include default field values where appropriate
4. Implement caching of issue type metadata to improve field validation

## References

- [Jira REST API v3 Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post)
- [Atlassian Document Format](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/) 