# Issue Metadata Assessment Implementation

## Overview

The Issue Metadata Assessment component evaluates the quality and appropriateness of an issue's metadata. This component focuses on five key aspects:

1. **Issue Type Evaluation** - Determines if the issue type matches the work described
2. **Summary Quality** - Assesses the clarity and specificity of the issue title
3. **Priority Alignment** - Validates if the assigned priority reflects the actual business impact
4. **Labels and Components** - Evaluates if categorization is appropriate
5. **Assignment History** - Reviews the history of assignee changes

The implementation will be an isolated function that returns metadata assessment results conforming to the `IssueAnalysisResult` interface.

## Implementation Approach

### Function Signature

```typescript
/**
 * Assesses the metadata quality of a Jira issue
 * @param issue The Jira issue to analyze
 * @param commentsResponse The comments associated with the issue
 * @returns An object containing metadata assessment results
 */
function assessMetadata(
  issue: JiraIssue, 
  commentsResponse: IssueCommentResponse
): {
  issueType: string;
  summary: string;
  priorityAppropriate: boolean;
  labelsAndComponentsAppropriate: boolean;
  assignmentChanges: number;
} {
  // Implementation goes here
}
```

### 1. Issue Type Evaluation

To determine if the issue type matches the work described, we need to analyze the issue's content and compare it with the assigned type.

```typescript
function evaluateIssueType(issue: JiraIssue, commentsResponse: IssueCommentResponse): string {
  const issueType = issue.fields.issuetype.name;
  const summary = issue.fields.summary;
  const description = issue.fields.description;
  
  // Extract text content from the issue description
  const descriptionText = extractTextFromDescription(description);
  
  // Extract text from comments
  const commentsText = commentsResponse.comments
    .map(comment => extractTextFromComment(comment))
    .join(' ');
  
  // Combine all text for analysis
  const allText = `${summary} ${descriptionText} ${commentsText}`;
  
  // Analyze text for keywords that indicate work type
  const hasBugIndicators = containsBugIndicators(allText);
  const hasFeatureIndicators = containsFeatureIndicators(allText);
  const hasTaskIndicators = containsTaskIndicators(allText);
  
  // Determine if assigned type matches content
  let suggestedType = issueType;
  
  if (issueType === 'Bug' && !hasBugIndicators) {
    suggestedType = hasFeatureIndicators ? 'Story' : 'Task';
  } else if (issueType === 'Story' && hasBugIndicators) {
    suggestedType = 'Bug';
  } else if (issueType === 'Task' && (hasBugIndicators || hasFeatureIndicators)) {
    suggestedType = hasBugIndicators ? 'Bug' : 'Story';
  }
  
  return suggestedType;
}

// Helper functions
function containsBugIndicators(text: string): boolean {
  const bugKeywords = [
    'bug', 'fix', 'issue', 'problem', 'error', 'crash', 'defect', 
    'broken', 'incorrect', 'not working', 'failing', 'exception'
  ];
  return bugKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

function containsFeatureIndicators(text: string): boolean {
  const featureKeywords = [
    'feature', 'enhancement', 'implement', 'add', 'new', 'create', 
    'user story', 'as a user', 'should be able to'
  ];
  return featureKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

function containsTaskIndicators(text: string): boolean {
  const taskKeywords = [
    'update', 'change', 'modify', 'refactor', 'improve', 'optimize', 
    'clean up', 'organize', 'rework', 'adjustment'
  ];
  return taskKeywords.some(keyword => text.toLowerCase().includes(keyword));
}
```

### 2. Summary Quality Assessment

Evaluating the quality of an issue summary focuses on clarity, specificity, and adherence to good practices.

```typescript
function evaluateSummaryQuality(issue: JiraIssue): string {
  const summary = issue.fields.summary;
  
  // Check length (too short may lack detail, too long may be unclear)
  if (summary.length < 10) {
    return 'Too short: Lacks sufficient detail';
  }
  if (summary.length > 100) {
    return 'Too long: Consider being more concise';
  }
  
  // Check for vague terms
  const vagueTerms = ['issue', 'problem', 'bug', 'error', 'fix', 'update', 'implement'];
  if (vagueTerms.some(term => summary.toLowerCase() === term)) {
    return 'Too vague: Be more specific about what needs to be done';
  }
  
  // Check for proper context
  if (!containsContext(summary)) {
    return 'Missing context: Add component/area information';
  }
  
  // Check for actionable language
  if (!containsActionableVerb(summary)) {
    return 'Not actionable: Use clear verbs to describe what needs to be done';
  }
  
  return 'Good: Clear, specific, and actionable';
}

function containsContext(summary: string): boolean {
  // Look for contextual markers like component names, areas, or specific identifiers
  // This would need to be customized for each project
  return true; // Simplified for this example
}

function containsActionableVerb(summary: string): boolean {
  const actionVerbs = [
    'add', 'create', 'implement', 'update', 'modify', 'fix', 'remove',
    'enhance', 'improve', 'optimize', 'refactor', 'integrate'
  ];
  return actionVerbs.some(verb => 
    new RegExp(`\\b${verb}\\b`, 'i').test(summary)
  );
}
```

### 3. Priority Alignment

To assess if the assigned priority reflects the actual business impact:

```typescript
function evaluatePriorityAlignment(issue: JiraIssue, commentsResponse: IssueCommentResponse): boolean {
  const priority = issue.fields.priority.name;
  
  // Extract text for analysis
  const summary = issue.fields.summary;
  const descriptionText = extractTextFromDescription(issue.fields.description);
  const commentsText = commentsResponse.comments
    .map(comment => extractTextFromComment(comment))
    .join(' ');
  
  const allText = `${summary} ${descriptionText} ${commentsText}`;
  
  // Check for high priority indicators in the text
  const highPriorityIndicators = [
    'urgent', 'critical', 'blocker', 'serious', 'severe', 
    'production', 'customer impact', 'deadline', 'asap',
    'high priority', 'important', 'emergency'
  ];
  
  const containsHighPriorityLanguage = highPriorityIndicators.some(
    indicator => allText.toLowerCase().includes(indicator)
  );
  
  // Check for low priority indicators in the text
  const lowPriorityIndicators = [
    'minor', 'trivial', 'when possible', 'not urgent', 'low priority',
    'can wait', 'nice to have', 'eventually', 'someday'
  ];
  
  const containsLowPriorityLanguage = lowPriorityIndicators.some(
    indicator => allText.toLowerCase().includes(indicator)
  );
  
  // Determine if priority aligns with content
  const highPriorities = ['Highest', 'High', 'Critical', 'Blocker'];
  const lowPriorities = ['Low', 'Lowest', 'Minor', 'Trivial'];
  
  const isHighPriority = highPriorities.includes(priority);
  const isLowPriority = lowPriorities.includes(priority);
  
  if (isHighPriority && containsLowPriorityLanguage) {
    return false; // Priority too high for content
  }
  
  if (isLowPriority && containsHighPriorityLanguage) {
    return false; // Priority too low for content
  }
  
  return true; // Priority appears appropriate
}
```

### 4. Labels and Components

To evaluate if labeling and component categorization is appropriate:

```typescript
function evaluateLabelsAndComponents(issue: JiraIssue): boolean {
  const labels = issue.fields.labels || [];
  const components = issue.fields.components || [];
  
  // Check if any labels or components exist
  if (labels.length === 0 && components.length === 0) {
    return false; // Neither labels nor components are specified
  }
  
  // Check for project-specific required labels (example)
  const requiredLabelCategories = [
    ['frontend', 'backend', 'api', 'database', 'infrastructure'], // Tech area
    ['feature', 'bugfix', 'refactor', 'documentation'] // Work type
  ];
  
  // Simplified check - in a real implementation, you'd validate against your specific labeling conventions
  const hasRequiredLabels = requiredLabelCategories.every(category => 
    category.some(label => labels.includes(label))
  );
  
  return hasRequiredLabels || components.length > 0;
}
```

### 5. Assignment History

To review the history of assignee changes:

```typescript
function countAssignmentChanges(issue: JiraIssue): number {
  const assigneeChanges = issue.changelog.histories
    .filter(history => 
      history.items.some(item => item.field === 'assignee')
    );
  
  return assigneeChanges.length;
}
```

### Combining Everything

Now we combine all evaluations into our main function:

```typescript
function assessMetadata(issue: JiraIssue, commentsResponse: IssueCommentResponse) {
  // Get issue type evaluation
  const issueType = evaluateIssueType(issue, commentsResponse);
  
  // Get summary quality
  const summary = evaluateSummaryQuality(issue);
  
  // Check priority alignment
  const priorityAppropriate = evaluatePriorityAlignment(issue, commentsResponse);
  
  // Evaluate labels and components
  const labelsAndComponentsAppropriate = evaluateLabelsAndComponents(issue);
  
  // Count assignment changes
  const assignmentChanges = countAssignmentChanges(issue);
  
  return {
    issueType,
    summary,
    priorityAppropriate,
    labelsAndComponentsAppropriate,
    assignmentChanges
  };
}
```

## Utility Functions

These helper functions are used throughout the implementation:

```typescript
function extractTextFromDescription(description: any): string {
  if (!description || !description.content) {
    return '';
  }
  
  // Recursively extract text from the Jira description object
  const extractText = (content: any): string => {
    if (!content) return '';
    
    if (Array.isArray(content)) {
      return content.map(extractText).join(' ');
    }
    
    if (content.text) {
      return content.text;
    }
    
    if (content.content) {
      return extractText(content.content);
    }
    
    return '';
  };
  
  return extractText(description.content);
}

function extractTextFromComment(comment: IssueComment): string {
  if (!comment.body || !comment.body.content) {
    return '';
  }
  
  // Similar to description extraction
  const extractText = (content: any): string => {
    if (!content) return '';
    
    if (Array.isArray(content)) {
      return content.map(extractText).join(' ');
    }
    
    if (content.text) {
      return content.text;
    }
    
    if (content.content) {
      return extractText(content.content);
    }
    
    return '';
  };
  
  return extractText(comment.body.content);
}
```

## Integration into the Main Analysis Function

The `assessMetadata` function would be integrated into the main `analyzeIssue` function:

```typescript
import type { IssueAnalysisResult } from './analyzeIssue.types'
import type { IssueCommentResponse } from '../../types/comment'
import type { JiraIssue } from '../../types/issue.types'

export function analyzeIssue(issue: JiraIssue, commentsResponse: IssueCommentResponse): Partial<IssueAnalysisResult> {
  // Perform metadata assessment
  const metadataAssessment = assessMetadata(issue, commentsResponse);
  
  // Start building the analysis result
  return {
    issueKey: issue.key,
    summary: issue.fields.summary,
    issueType: issue.fields.issuetype.name,
    metadata: metadataAssessment,
    // Other analysis results would be added here
  };
}
```

## Testing

Tests should be written to validate each aspect of the metadata assessment:

```typescript
// src/jira/services/analyzeIssue/__tests__/assessMetadata.test.ts

import { assessMetadata } from '../assessMetadata';
import { mockIssue, mockCommentsResponse } from './mocks';

describe('assessMetadata', () => {
  test('should correctly identify issue type mismatches', () => {
    const bugIssueMockedAsStory = { 
      ...mockIssue,
      fields: {
        ...mockIssue.fields,
        issuetype: { name: 'Story', id: '1', self: '', description: '', iconUrl: '', subtask: false, avatarId: 0, hierarchyLevel: 0 },
        summary: 'Fix critical bug in login process',
        description: { content: [{ content: [{ text: 'The system crashes when users attempt to log in.', type: 'text' }], type: 'paragraph' }], type: 'doc', version: 1 }
      }
    };
    
    const result = assessMetadata(bugIssueMockedAsStory, mockCommentsResponse);
    expect(result.issueType).toBe('Bug');
  });
  
  test('should evaluate summary quality', () => {
    const poorSummaryIssue = {
      ...mockIssue,
      fields: {
        ...mockIssue.fields,
        summary: 'Fix'
      }
    };
    
    const result = assessMetadata(poorSummaryIssue, mockCommentsResponse);
    expect(result.summary).toContain('Too short');
  });
  
  // Additional tests for priority, labels/components, and assignment changes
});
```

## Conclusion

This implementation provides a comprehensive assessment of a Jira issue's metadata quality. The function evaluates the issue type, summary quality, priority alignment, labels/components, and assignment history to identify potential improvements.

Each evaluation component can be further refined based on specific project needs and conventions. For example, the issue type evaluation could be tailored to support additional issue types, and the summary quality assessment could be adjusted to align with project-specific naming conventions.

The modular approach allows for easy extension and maintenance, as each evaluation aspect is encapsulated in its own function. 