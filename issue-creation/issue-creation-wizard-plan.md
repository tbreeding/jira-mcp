# Jira Issue Creation Wizard Implementation Plan

## 1. Overview

The Jira Issue Creation Wizard is a guided tool that helps users create well-structured Jira issues that follow agile/scrum best practices. The wizard will walk users through a step-by-step process, ensuring all required and recommended fields are completed properly before submission.

### Key Features:
- Project and issue type selection
- Dynamic field collection based on issue type requirements
- Guidance for quality issue creation following agile/scrum practices
- Form validation and error handling
- Real-time issue quality analysis and feedback
- Issue submission with clear success/failure feedback

## 2. User Journey

### Step 1: Initiate Wizard
- User starts the wizard
- Clear explanation of the wizard's purpose and steps is provided
- System checks if another wizard session is in progress

### Step 2: Project Selection
- User is presented with a list of available Jira projects
- Search/filter functionality for project selection
- Project description (if available) to help with selection

### Step 3: Issue Type Selection
- Based on selected project, display available issue types
- Visual representation with icons and descriptions
- Clear guidance on when to use each issue type

### Step 4: Field Completion
- Dynamically generated form based on required and recommended fields
- Fields are organized in logical groups
- Clear progress indicator (e.g., "Step 3 of 5")
- Distinction between required and optional fields
- Contextual help and examples for each field
- Real-time validation with helpful error messages
- Real-time quality analysis feedback as fields are completed

### Step 5: Issue Review
- Summary of all entered information
- Comprehensive issue quality analysis results
- Specific suggestions for improving issue quality
- Ability to navigate back to edit specific sections
- Final validation check before submission

### Step 6: Issue Creation
- Submit the issue to Jira
- Loading indicator during submission
- Clear success/failure feedback
- For success: Display issue key and link (https://<jira url>/browse/<new issue key>)
- Option to create another issue or exit

## 3. Technical Implementation Details

### API Endpoints Required:

1. **Fetch Projects**
   - Endpoint: `GET /rest/api/3/project`
   - Purpose: Get list of available projects for selection
   - Response: Project IDs, keys, names, and descriptions

2. **Fetch Issue Types**
   - Endpoint: `GET /rest/api/3/project/{projectIdOrKey}/issuetypes`
   - Purpose: Get available issue types for selected project
   - Response: Issue type IDs, names, descriptions, and icons

3. **Fetch Create Metadata**
   - Endpoint: `GET /rest/api/3/issue/createmeta?projectKeys={projectKey}&issuetypeIds={issueTypeId}&expand=issueTypes`
   - Purpose: Get required and available fields for selected issue type
   - Response: Field definitions, requirements, allowed values, etc.

4. **Create Issue**
   - Endpoint: `POST /rest/api/3/issue`
   - Purpose: Submit the completed issue to Jira
   - Request: JSON payload with all field values
   - Response: Issue key, success/failure status

### State Management:

#### Wizard State Structure:
```typescript
interface WizardState {
  active: boolean;          // Whether a wizard is in progress
  currentStep: WizardStep;  // Current step in the process
  projectKey?: string;      // Selected project (if step >= project selection)
  issueTypeId?: string;     // Selected issue type (if step >= issue type selection)
  fields: Record<string, any>; // Field values collected so far
  validation: {             // Validation status
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
  };
  analysis?: {              // Analysis results (if available)
    metadata?: any;
    complexity?: any;
    completeness?: any;
  };
  timestamp: number;        // When the wizard was started/last updated
}

enum WizardStep {
  INITIATE = 'initiate',
  PROJECT_SELECTION = 'project_selection',
  ISSUE_TYPE_SELECTION = 'issue_type_selection',
  FIELD_COMPLETION = 'field_completion',
  REVIEW = 'review',
  SUBMISSION = 'submission'
}
```

#### Wizard State Management Tools:

Following the Model Context Protocol (MCP) architecture, we'll implement state management using tools rather than HTTP endpoints:

1. **Get Wizard State Tool**
   - Name: `mcp_IssueCreationWizard_getState`
   - Parameters: None
   - Purpose: Retrieve current wizard state
   - Returns: Current wizard state object or null if no wizard is active

2. **Check Wizard Status Tool**
   - Name: `mcp_IssueCreationWizard_getStatus`
   - Parameters: None
   - Purpose: Check if a wizard is currently in progress
   - Returns: Status object with active flag and metadata

3. **Reset Wizard State Tool**
   - Name: `mcp_IssueCreationWizard_resetState`
   - Parameters: 
     ```typescript
     { 
       confirmation: boolean // Optional confirmation parameter
     }
     ```
   - Purpose: Clear the current wizard state and start over
   - Returns: Success/failure status

4. **Update Wizard State Tool**
   - Name: `mcp_IssueCreationWizard_updateState`
   - Parameters: 
     ```typescript
     {
       state: Partial<WizardState> // Partial state update
     }
     ```
   - Purpose: Update the current wizard state
   - Returns: Updated wizard state with validation results

5. **Create Issue Tool**
   - Name: `mcp_IssueCreationWizard_createIssue`
   - Parameters: None (uses current wizard state)
   - Purpose: Creates the Jira issue using the current wizard state
   - Returns: Issue creation result with key and URL

#### Implementation Pattern:

Each tool will follow the existing pattern in the codebase:

```typescript
// Tool definition
export const getWizardStateTool = {
  name: 'mcp_IssueCreationWizard_getState',
  description: 'Retrieves the current state of the issue creation wizard',
  parameters: {
    properties: {},
    required: [],
    type: 'object'
  }
}

// Tool executor factory
export function getWizardStateToolExecutor(config: JiraApiConfig): ToolExecutor {
  return async function(parameters: Record<string, unknown>): Promise<ToolResult> {
    // Implementation that returns the current wizard state
    // Will use in-memory state management
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(currentWizardState)
        }
      ]
    }
  }
}
```

#### Single Instance Constraint:
- Only one wizard process can be active at a time
- Attempting to start a new wizard while one is in progress will return appropriate status
- Users can choose to continue the existing wizard or reset and start over
- State is maintained in-memory on the server

### UI Components Needed:
- Step navigator
- Form elements for various field types
- Field validation indicators
- Loading states
- Error/success messages
- Progress indicators
- Analysis feedback components
- Quality improvement suggestions

## 4. Field Handling by Issue Type

### Common Fields Across Issue Types:
- Summary (title)
- Description
- Priority
- Labels
- Assignee
- Reporter

### User Story Specific Fields:
- Acceptance Criteria
- Story Points
- Epic Link
- User Value Statement (guided with "As a [user], I want to [action], so that [benefit]" format)
- Definition of Done checklist

### Bug Specific Fields:
- Steps to Reproduce
- Expected vs Actual Behavior
- Environment/Version
- Severity
- Attachments (screenshots, logs)

### Epic Specific Fields:
- Business Goal/Objective
- Success Metrics
- Scope Definition
- Timeline

### Task Specific Fields:
- Related Issues
- Time Estimate
- Implementation Details

## 5. Error Handling and Edge Cases

### API Connectivity Issues:
- Implement retry with exponential backoff
- Clear messaging for network problems

### Authorization/Permission Issues:
- Pre-check permissions when possible
- Clear error messages for permission denials
- Guidance on how to request access

### Field Validation:
- Required field validation
- Format validation (dates, emails, etc.)
- Character limits
- Complex validation rules (dependencies between fields)

### Large Datasets:
- Pagination for large project lists
- Search/filter for user pickers and multi-selects
- Virtualized lists for performance

### Session Management:
- Maintain wizard state for current session
- Warn before browser/tab close if wizard is in progress
- Provide option to resume or restart if session is interrupted

## 6. Agile/Scrum Best Practices Integration

### Quality Guidance by Issue Type:

#### User Stories:
- Enforce/suggest user story format
- Prompt for clear acceptance criteria
- Suggest appropriate story points
- Ensure proper epic linking

#### Bugs:
- Enforce clear reproduction steps
- Separate expected from actual behavior
- Ensure environment information
- Prompt for severity assessment

#### Epics:
- Link to business objectives
- Verify scope is appropriate for an epic
- Suggest success metrics

#### Tasks:
- Ensure they're small, well-defined units of work
- Link to parent stories when appropriate
- Suggest time estimates

### General Guidance:
- Tooltips and examples for best practices
- Warning for potential anti-patterns
- Suggestions for appropriate labels
- Sprint assignment recommendations

## 7. Real-Time Issue Analysis Integration

### Analysis Components:
- **Metadata Assessment**:
  - Evaluates field completeness and correctness
  - Ensures proper issue classification
  - Checks for required fields by issue type

- **Complexity Analysis**:
  - Analyzes description complexity and clarity
  - Identifies potential scope issues
  - Suggests improvements for clarity

- **Completeness Evaluation**:
  - Checks if all necessary information is provided
  - Identifies missing important fields
  - Suggests additional information to include

### Analysis Implementation:
- Use existing analysis functions from the codebase
- Create an empty comments object for new issues: `{ comments: [] }`
- Transform wizard state into a format compatible with analysis functions
- Run analyses at appropriate points in the wizard flow:
  - Basic analysis during field completion
  - Comprehensive analysis during review step

### User Experience:
- Show inline feedback as fields are completed
- Display analysis scores with visual indicators
- Provide specific, actionable suggestions for improvement
- Allow users to see "before/after" quality scores when implementing suggestions

## 8. Future Enhancements

### Potential Future Features:
- Template support for quick issue creation
- Bulk creation capability
- Integration with roadmap planning
- AI-assisted field completion
- Custom workflows for different teams
- Saved favorites/recent selections
- Analytics on issue creation patterns
- Integration with project planning tools

---

This implementation plan provides a comprehensive roadmap for developing the Jira Issue Creation Wizard, focusing on both user experience and technical implementation details. The plan prioritizes guiding users to create high-quality issues that follow agile/scrum best practices while ensuring all required information is captured, with the added benefit of real-time quality analysis. 