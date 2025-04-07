# Jira Issue Analysis Framework

## Purpose
This framework provides a structured approach to analyzing Jira issues to help teams identify gaps, risks, and improvement opportunities. The analysis offers objective metrics and qualitative insights to enhance issue quality, team performance, and project outcomes.

## Analysis Components

### 1. Issue Metadata Assessment [COMPLETE]
- **Issue Type**: Evaluates if the issue type matches the actual work described
- **Summary Quality**: Assesses clarity and specificity of the issue title
- **Priority Alignment**: Checks if assigned priority reflects actual business impact
- **Labels and Components**: Evaluates appropriate use of categorization
- **Assignment History**: Reviews the history of assignee changes

### 2. Complexity Analysis [COMPLETE]
- **Score**: 1-10 scale (1: trivial, 10: extremely complex)
- **Factors**:
  - Technical complexity indicators in description/comments
  - Number of subtasks or linked issues
  - Comment volume and discussion depth
  - Number of assignee changes
  - Estimation changes over time
  - Field modifications frequency
  - Component/system touchpoints

### 3. Completeness Evaluation [COMPLETE]
- **Score**: 1-10 scale (10: fully detailed and actionable)
- **Missing Information**: Identifies key absent details like:
  - Acceptance criteria
  - Technical constraints
  - Dependencies
  - Testing requirements
  - Design specifications
  - User impact considerations

### 4. Dependencies Analysis [COMPLETE]
- **Blockers**: Explicitly linked blocking issues
- **Related Issues**: Non-blocking but related issues
- **Implicit Dependencies**: Dependencies mentioned in comments but not formally linked
- **External Dependencies**: Systems, teams, or approvals needed

### 5. Duration Assessment [COMPLETE]
- **In-Progress Duration**: Business days from first "in progress" to last "done" status
- **Sprint Boundary Analysis**: Whether issue spans multiple sprints
- **Sprint Reassignments**: Number of times the issue was reassigned or carried over from one sprint to another
- **Story Point to Duration Ratio**: Comparing estimated vs. actual time
- **Status Transitions**: 
  - First moved to "in progress" (fields.status.statusCategory.key === 'indeterminate')
  - Last moved to "done" (fields.status.statusCategory.key === 'done')
  - Time spent in each status
- **Status Cycling**: Number of times an issue returned to previously visited statuses (potential sign of rework)
- **Blocked Time Assessment**: Duration spent in "On Hold" or "Blocked" statuses, including reasons for blockage when available

### 6. Continuity Analysis [COMPLETE]
- **Flow Efficiency**: Ratio of active work time to total elapsed time
- **Stagnation Periods**: Detection of periods with no updates or progress
  - Periods of inactivity exceeding team's standard SLA (e.g., >3 business days)
  - Patterns of stagnation (e.g., weekends, specific phases, specific assignees)
- **Communication Gaps**: Extended periods without comments or updates
- **Context Switching Impact**: Analysis of assignee changes mid-implementation
  - Timing of handoffs
  - Quality of knowledge transfer (comments, documentation)
  - Velocity changes after handoffs
- **Momentum Indicators**:
  - Comment frequency/timing patterns
  - Commit frequency (if linked to code repository)
  - Update consistency throughout issue lifecycle
- **Work Fragmentation**: Analysis of whether work occurred in continuous blocks or was frequently interrupted
- **Late-Stage Changes**: Identification of significant scope or requirement changes late in the implementation
- **Feedback Loops**: Evaluation of time between questions and responses in comments
- **Resolution Consistency**: Analysis of resolution process compared to similar issues

### 7. Risk Identification [COMPLETE]
- **Score**: 1-10 scale (10: highest risk)
- **Risk Items**:
  - Technical debt indicators
  - Test coverage concerns
  - Architecture impact
  - Performance considerations
  - Security implications
  - Cross-team dependencies
  - Skill/knowledge concentration risks
  - Timeline feasibility

### 8. Ambiguities Detection
- Conflicting requirements in description/comments
- Vague language markers ("etc.", "and so on", "TBD")
- Missing quantifiable metrics
- Undefined edge cases
- Unclarified technical approaches

### 9. Implementation Recommendations
- Specific action items to improve issue quality
- Suggestions for breaking down complex issues
- Reference to patterns from similar successful issues
- Resource allocation recommendations
- Testing strategy suggestions

## Implementation Approach

The analysis will:
1. Extract raw data from issue fields, changelog, and comments
2. Process the data through specialized analyzers for each component
3. Apply heuristics and pattern matching to identify concerns
4. Calculate objective metrics where possible
5. Generate recommendations based on identified patterns
6. Format results in a standardized interface for consumption

## Analysis Result Interface

```typescript
/**
 * Comprehensive analysis result for a Jira issue
 */
export interface IssueAnalysisResult {
  issueKey: string;
  summary: string;
  issueType: string;
  
  // Overall quality score (1-10)
  qualityScore: number;
  
  metadata: {
    issueType: string;
    summary: string;
    priorityAppropriate: boolean;
    labelsAndComponentsAppropriate: boolean;
    assignmentChanges: number;
  };
  
  complexity: {
    score: number; // 1-10 scale
    factors: string[];
    level: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very complex';
  };
  
  completeness: {
    score: number; // 1-10 scale
    missingInformation: string[];
    suggestions: string[];
  };
  
  dependencies: {
    blockers: Array<{key: string, summary: string}>;
    relatedIssues: Array<{key: string, summary: string, relationship: string}>;
    implicitDependencies: string[]; // Dependencies mentioned in comments
    externalDependencies: string[]; // External systems or teams
  };
  
  duration: {
    inProgressDays: number | null;
    exceedsSprint: boolean;
    sprintReassignments: number; // Number of times moved between sprints
    pointToDurationRatio: number | null; // Story points to days ratio
    statusTransitions: {
      firstInProgress: string | null; // ISO date string
      lastDone: string | null; // ISO date string
      averageTimeInStatus: Record<string, number>; // Status name to hours
    };
    statusCycling: {
      count: Record<string, number>; // Status name to number of re-entries
      totalRevisits: number; // Total number of status revisits
    };
    blockedTime: {
      totalDays: number; // Total days in blocked/on-hold statuses
      reasons: string[]; // Extracted reasons for blockage
    };
    anomalies: string[]; // Duration pattern anomalies
  };
  
  continuity: {
    flowEfficiency: number; // Percentage of time in active work vs. total time
    stagnationPeriods: Array<{
      startDate: string; // ISO date string
      endDate: string; // ISO date string
      durationDays: number;
      status: string; // Status during stagnation
      assignee: string | null;
    }>;
    longestStagnationPeriod: number; // Days
    communicationGaps: Array<{
      startDate: string; // ISO date string
      endDate: string; // ISO date string
      durationDays: number;
    }>;
    contextSwitches: {
      count: number;
      timing: Array<{
        date: string; // ISO date string
        fromAssignee: string | null;
        toAssignee: string | null;
        status: string;
        daysFromStart: number;
      }>;
      impact: string; // Assessment of impact on velocity
    };
    momentumScore: number; // 1-10 scale (10 being perfect momentum)
    workFragmentation: {
      fragmentationScore: number; // 1-10 scale (1 being most fragmented)
      activeWorkPeriods: number; // Count of distinct active periods
    };
    lateStageChanges: Array<{
      date: string; // ISO date string
      field: string;
      description: string;
      percentComplete: number; // Estimated percentage of completion when change occurred
    }>;
    feedbackResponseTime: number; // Average hours between questions and responses
  };
  
  risks: {
    score: number; // 1-10 scale
    items: string[];
    mitigationSuggestions: string[];
  };
  
  ambiguities: {
    items: string[];
    locations: Array<{field: string, excerpt: string}>;
  };
  
  implementationRecommendations: string[];
}
```

## Agile/Scrum Benefits

This analysis framework helps teams:
- Improve issue refinement quality
- Identify patterns in challenging issues
- Reduce cycle time through better preparation
- Minimize blockers and dependencies
- Enable more accurate estimation
- Provide coaching opportunities for team members
- Enhance sprint planning and backlog grooming 