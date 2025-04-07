# Implementing Complexity Analysis for Jira Issues

## Overview
This document outlines the implementation approach for the Complexity Analysis component of the Jira issue analysis function. The goal is to create an isolated, testable function that evaluates the complexity of a Jira issue based on various factors as specified in the analysis framework.

## Interface
The function will align with the following section of the `IssueAnalysisResult` interface:

```typescript
complexity: {
  score: number; // 1-10 scale
  factors: string[]; // Reasons for the complexity score
  level: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very complex';
}
```

## Implementation Plan

### Function Signature
```typescript
export function getComplexityAnalysis(
  issue: JiraIssue, 
  commentsResponse: IssueCommentResponse
): {
  score: number;
  factors: string[];
  level: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very complex';
}
```

### Core Implementation

```typescript
import type { JiraIssue } from '../../../types/issue.types';
import type { IssueCommentResponse } from '../../../types/comment';

/**
 * Analyzes the complexity of a Jira issue based on multiple factors
 * 
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @returns Complexity analysis with score, factors, and complexity level
 */
export function getComplexityAnalysis(
  issue: JiraIssue, 
  commentsResponse: IssueCommentResponse
): {
  score: number;
  factors: string[];
  level: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very complex';
} {
  const factors: string[] = [];
  let complexityScore = 0;
  
  // 1. Analyze technical complexity indicators in description/comments
  const technicalComplexity = analyzeTechnicalComplexity(issue, commentsResponse);
  complexityScore += technicalComplexity.score;
  if (technicalComplexity.factor) {
    factors.push(technicalComplexity.factor);
  }
  
  // 2. Count subtasks and linked issues
  const linkedIssuesComplexity = analyzeLinkedIssues(issue);
  complexityScore += linkedIssuesComplexity.score;
  if (linkedIssuesComplexity.factor) {
    factors.push(linkedIssuesComplexity.factor);
  }
  
  // 3. Evaluate comment volume and discussion depth
  const commentComplexity = analyzeComments(commentsResponse);
  complexityScore += commentComplexity.score;
  if (commentComplexity.factor) {
    factors.push(commentComplexity.factor);
  }
  
  // 4. Count assignee changes
  const assigneeChanges = countAssigneeChanges(issue);
  complexityScore += assigneeChanges.score;
  if (assigneeChanges.factor) {
    factors.push(assigneeChanges.factor);
  }
  
  // 5. Track estimation changes
  const estimationChanges = analyzeEstimationChanges(issue);
  complexityScore += estimationChanges.score;
  if (estimationChanges.factor) {
    factors.push(estimationChanges.factor);
  }
  
  // 6. Count field modifications frequency
  const fieldModifications = analyzeFieldModifications(issue);
  complexityScore += fieldModifications.score;
  if (fieldModifications.factor) {
    factors.push(fieldModifications.factor);
  }
  
  // 7. Analyze component/system touchpoints
  const componentTouchpoints = analyzeComponentTouchpoints(issue);
  complexityScore += componentTouchpoints.score;
  if (componentTouchpoints.factor) {
    factors.push(componentTouchpoints.factor);
  }

  // Normalize score to 1-10 scale
  let normalizedScore = Math.min(Math.max(Math.round(complexityScore), 1), 10);
  
  // Determine complexity level
  const level = determineComplexityLevel(normalizedScore);
  
  return {
    score: normalizedScore,
    factors,
    level
  };
}

/**
 * Analyzes technical complexity indicators in description and comments
 */
function analyzeTechnicalComplexity(
  issue: JiraIssue, 
  commentsResponse: IssueCommentResponse
): { score: number; factor: string | null; } {
  let score = 0;
  
  // Technical keywords that might indicate complexity
  const complexityKeywords = [
    'complex', 'complicated', 'challenging', 'difficult', 
    'architecture', 'refactor', 'performance', 'scalability', 
    'security', 'optimization', 'database migration',
    'concurrency', 'race condition', 'deadlock', 'memory leak',
    'distributed', 'microservice', 'asynchronous', 'latency'
  ];
  
  // Check description for technical complexity
  const description = issue.fields.description;
  let keywordsFound: string[] = [];
  let keywordCount = 0;
  
  if (description) {
    const descriptionText = typeof description === 'string' 
      ? description 
      : JSON.stringify(description);
    
    complexityKeywords.forEach(keyword => {
      if (descriptionText.toLowerCase().includes(keyword.toLowerCase())) {
        keywordsFound.push(keyword);
        keywordCount++;
      }
    });
  }
  
  // Check comments for technical complexity
  commentsResponse.comments.forEach(comment => {
    const commentText = JSON.stringify(comment.body);
    
    complexityKeywords.forEach(keyword => {
      if (commentText.toLowerCase().includes(keyword.toLowerCase()) && 
          !keywordsFound.includes(keyword)) {
        keywordsFound.push(keyword);
        keywordCount++;
      }
    });
  });
  
  // Score based on keyword frequency
  if (keywordCount > 5) {
    score = 3;
  } else if (keywordCount > 2) {
    score = 2;
  } else if (keywordCount > 0) {
    score = 1;
  }
  
  const factor = keywordsFound.length > 0 
    ? `Technical complexity indicators: ${keywordsFound.slice(0, 3).join(', ')}${keywordsFound.length > 3 ? '...' : ''}`
    : null;
  
  return { score, factor };
}

/**
 * Analyzes the number of subtasks and linked issues
 */
function analyzeLinkedIssues(issue: JiraIssue): { score: number; factor: string | null; } {
  let score = 0;
  let subtaskCount = 0;
  let linkedIssueCount = 0;
  
  // Count subtasks
  if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
    subtaskCount = issue.fields.subtasks.length;
  }
  
  // Count linked issues
  if (issue.fields.issuelinks && issue.fields.issuelinks.length > 0) {
    linkedIssueCount = issue.fields.issuelinks.length;
  }
  
  const totalRelatedIssues = subtaskCount + linkedIssueCount;
  
  // Score based on number of related issues
  if (totalRelatedIssues > 8) {
    score = 3;
  } else if (totalRelatedIssues > 4) {
    score = 2;
  } else if (totalRelatedIssues > 0) {
    score = 1;
  }
  
  const factor = totalRelatedIssues > 0 
    ? `Related issues: ${subtaskCount} subtasks and ${linkedIssueCount} linked issues`
    : null;
  
  return { score, factor };
}

/**
 * Analyzes comment volume and discussion depth
 */
function analyzeComments(commentsResponse: IssueCommentResponse): { score: number; factor: string | null; } {
  let score = 0;
  const commentCount = commentsResponse.comments.length;
  
  // Calculate average comment length as a proxy for discussion depth
  let totalCommentLength = 0;
  commentsResponse.comments.forEach(comment => {
    totalCommentLength += JSON.stringify(comment.body).length;
  });
  
  const averageCommentLength = commentCount > 0 ? totalCommentLength / commentCount : 0;
  const isDeepDiscussion = averageCommentLength > 200; // Arbitrary threshold for "deep" discussion
  
  // Score based on comment volume and depth
  if (commentCount > 10 && isDeepDiscussion) {
    score = 3;
  } else if (commentCount > 5 || isDeepDiscussion) {
    score = 2;
  } else if (commentCount > 0) {
    score = 1;
  }
  
  const factor = commentCount > 0
    ? `Discussion volume: ${commentCount} comments${isDeepDiscussion ? ' with in-depth discussion' : ''}`
    : null;
  
  return { score, factor };
}

/**
 * Counts the number of assignee changes
 */
function countAssigneeChanges(issue: JiraIssue): { score: number; factor: string | null; } {
  let assigneeChanges = 0;
  let previousAssignee = null;
  
  // Analyze changelog for assignee changes
  if (issue.changelog && issue.changelog.histories) {
    issue.changelog.histories.forEach(history => {
      history.items.forEach(item => {
        if (item.field === 'assignee') {
          // Only count if it's a different assignee
          if (previousAssignee !== item.to) {
            assigneeChanges++;
            previousAssignee = item.to;
          }
        }
      });
    });
  }
  
  let score = 0;
  if (assigneeChanges > 2) {
    score = 2;
  } else if (assigneeChanges > 0) {
    score = 1;
  }
  
  const factor = assigneeChanges > 0
    ? `Assignee changes: Issue was reassigned ${assigneeChanges} times`
    : null;
  
  return { score, factor };
}

/**
 * Analyzes changes in estimation
 */
function analyzeEstimationChanges(issue: JiraIssue): { score: number; factor: string | null; } {
  let estimationChanges = 0;
  
  // Fields that might contain estimation information
  const estimationFields = [
    'timeoriginalestimate',
    'timeestimate',
    'customfield_10106', // Story points in many Jira instances
  ];
  
  if (issue.changelog && issue.changelog.histories) {
    issue.changelog.histories.forEach(history => {
      history.items.forEach(item => {
        if (estimationFields.includes(item.field)) {
          estimationChanges++;
        }
      });
    });
  }
  
  let score = 0;
  if (estimationChanges > 2) {
    score = 2;
  } else if (estimationChanges > 0) {
    score = 1;
  }
  
  const factor = estimationChanges > 0
    ? `Estimation changes: Estimate was adjusted ${estimationChanges} times`
    : null;
  
  return { score, factor };
}

/**
 * Analyzes the frequency of field modifications
 */
function analyzeFieldModifications(issue: JiraIssue): { score: number; factor: string | null; } {
  let fieldModifications = 0;
  const uniqueFields = new Set<string>();
  
  if (issue.changelog && issue.changelog.histories) {
    issue.changelog.histories.forEach(history => {
      history.items.forEach(item => {
        fieldModifications++;
        uniqueFields.add(item.field);
      });
    });
  }
  
  // High number of modifications or many different fields modified indicates complexity
  let score = 0;
  if (fieldModifications > 15 || uniqueFields.size > 8) {
    score = 3;
  } else if (fieldModifications > 8 || uniqueFields.size > 4) {
    score = 2;
  } else if (fieldModifications > 0) {
    score = 1;
  }
  
  const factor = fieldModifications > 0
    ? `Field modifications: ${fieldModifications} changes across ${uniqueFields.size} different fields`
    : null;
  
  return { score, factor };
}

/**
 * Analyzes component/system touchpoints
 */
function analyzeComponentTouchpoints(issue: JiraIssue): { score: number; factor: string | null; } {
  const components = issue.fields.components || [];
  const componentCount = components.length;
  
  let score = 0;
  if (componentCount > 3) {
    score = 3;
  } else if (componentCount > 1) {
    score = 2;
  } else if (componentCount > 0) {
    score = 1;
  }
  
  const factor = componentCount > 0
    ? `Component touchpoints: Issue affects ${componentCount} components/systems`
    : null;
  
  return { score, factor };
}

/**
 * Determines the complexity level based on the score
 */
function determineComplexityLevel(score: number): 'trivial' | 'simple' | 'moderate' | 'complex' | 'very complex' {
  if (score <= 2) {
    return 'trivial';
  } else if (score <= 4) {
    return 'simple';
  } else if (score <= 6) {
    return 'moderate';
  } else if (score <= 8) {
    return 'complex';
  } else {
    return 'very complex';
  }
}
```

## Testing Strategy

The implementation should be tested with:

1. **Unit Tests**:
   - Test each sub-analyzer function independently
   - Verify score calculation with mock data
   - Test edge cases (empty issues, extensive comments, etc.)

2. **Integration Tests**:
   - Test with real Jira issue data
   - Verify correct interface implementation

3. **Test Cases**:
   - Simple issues with minimal metadata
   - Complex issues with many subtasks and comments
   - Issues with extensive change logs
   - Edge cases with missing data

## Sample Test Implementation

```typescript
import { getComplexityAnalysis } from './getComplexityAnalysis';
import { mockJiraIssue, mockCommentsResponse } from '../../../test/mocks';

describe('getComplexityAnalysis', () => {
  it('should return low complexity for simple issues', () => {
    const simpleIssue = { ...mockJiraIssue, fields: { ...mockJiraIssue.fields } };
    const emptyComments = { ...mockCommentsResponse, comments: [] };
    
    // Ensure issue has minimal complexity indicators
    simpleIssue.changelog = { startAt: 0, maxResults: 0, total: 0, histories: [] };
    simpleIssue.fields.subtasks = [];
    simpleIssue.fields.issuelinks = [];
    simpleIssue.fields.components = [];
    
    const result = getComplexityAnalysis(simpleIssue, emptyComments);
    
    expect(result.score).toBeLessThanOrEqual(3);
    expect(result.level).toMatch(/trivial|simple/);
    expect(result.factors.length).toBe(0);
  });
  
  it('should return high complexity for complex issues', () => {
    const complexIssue = { ...mockJiraIssue, fields: { ...mockJiraIssue.fields } };
    const extensiveComments = { 
      ...mockCommentsResponse, 
      comments: Array(15).fill(mockCommentsResponse.comments[0] || {}) 
    };
    
    // Add complexity indicators
    complexIssue.changelog = { 
      startAt: 0, 
      maxResults: 50, 
      total: 50, 
      histories: Array(20).fill({
        id: '1',
        author: { accountId: 'user1', displayName: 'User 1' },
        created: '2023-01-01T00:00:00.000Z',
        items: [
          { field: 'assignee', from: 'user1', to: 'user2' },
          { field: 'timeestimate', from: '1d', to: '3d' }
        ]
      })
    };
    
    complexIssue.fields.subtasks = Array(5).fill({ id: '1' });
    complexIssue.fields.issuelinks = Array(5).fill({ id: '1', type: { name: 'Relates' } });
    complexIssue.fields.components = Array(4).fill({ id: '1', name: 'Component 1' });
    complexIssue.fields.description = 'This is a complex issue with refactoring needed. Performance issues and security concerns.';
    
    const result = getComplexityAnalysis(complexIssue, extensiveComments);
    
    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.level).toMatch(/complex|very complex/);
    expect(result.factors.length).toBeGreaterThan(3);
  });
});
```

## Integration with Main Analyzer

To integrate this module with the main analysis function, simply import and call it:

```typescript
import { getComplexityAnalysis } from './complexityAnalysis/getComplexityAnalysis';

export function analyzeIssue(issue: JiraIssue, commentsResponse: IssueCommentResponse): Partial<IssueAnalysisResult> {
  // Perform metadata assessment
  const metadataAssessment = getMetadataAssessment(issue, commentsResponse);
  
  // Perform complexity analysis
  const complexityAnalysis = getComplexityAnalysis(issue, commentsResponse);
  
  // Return analysis result with metadata assessment and complexity analysis
  return {
    issueKey: issue.key,
    summary: issue.fields.summary,
    issueType: issue.fields.issuetype.name,
    metadata: metadataAssessment,
    complexity: complexityAnalysis,
    // Other analysis components would be added here
  };
}
```

## Conclusion

This implementation provides a comprehensive, modular, and testable approach to analyzing Jira issue complexity. It follows the criteria outlined in the analysis framework and can be easily integrated into the main analyzer function. The implementation balances simplicity with comprehensiveness, avoiding unnecessary complexity while delivering accurate complexity evaluation. 