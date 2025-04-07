# Duration Assessment Implementation

## Overview

The Duration Assessment component analyzes the timeline and progress patterns of a Jira issue through its lifecycle. This analysis provides insights into how efficiently an issue moves through the workflow, identifies potential bottlenecks, and highlights process inefficiencies.

## Function Signature

```typescript
function getDurationAssessment(issue: JiraIssue, commentsResponse: IssueCommentResponse): DurationAssessment
```

## Input Data Analysis

### Primary Data Sources
1. **Issue Changelog** - Contains all transitions between statuses with timestamps
2. **Sprint History** - Records which sprints the issue was assigned to
3. **Status Fields** - Current and historical status values
4. **Story Points** - Estimation values for comparison with actual duration

### Key Data Points to Extract
- All status transitions with timestamps
- Sprint associations and changes
- Time spent in each status category (To Do, In Progress, Done)
- Blocked/On Hold status periods and reasons

## Implementation Logic

### 1. In-Progress Duration Calculation

The function should:
1. Extract all status transitions from the issue changelog
2. Identify the first timestamp when the issue moved to any status categorized as "in progress" 
   - Look for `changelog.items` where `field === 'status'` and `toString` is a status where `statusCategory.key === 'indeterminate'`
3. Identify the last timestamp when the issue moved to any status categorized as "done"
   - Look for `changelog.items` where `field === 'status'` and `toString` is a status where `statusCategory.key === 'done'`
4. Calculate the business days between these two dates
   - Filter out weekends and holidays
   - Account for time zone differences if relevant

### 2. Sprint Boundary Analysis

The function should:
1. Extract all sprint associations from issue history
2. Determine if the issue spans multiple sprints by:
   - Counting unique sprint IDs associated with the issue
   - Checking if the issue was ever moved from one sprint to another
3. Flag issues that crossed sprint boundaries as potential indicators of scope or estimation problems

### 3. Sprint Reassignments Tracking

The function should:
1. Parse the changelog for sprint field changes
2. Count how many times the issue was reassigned to different sprints
3. Identify patterns in reassignments (e.g., consistently rolling over to next sprint)

### 4. Story Point to Duration Ratio

The function should:
1. Retrieve the issue's story point value (if available)
2. Calculate the ratio of story points to actual business days spent in progress
3. Compare this ratio to team or project averages (if available)
4. Flag significant deviations from expected ratios

### 5. Status Transitions Analysis

The function should:
1. Build a complete timeline of all status transitions
2. Calculate time spent in each status:
   ```
   For each status:
     Find all periods where the issue was in this status
     Sum the durations
     Store in a map of status name to hours spent
   ```
3. Identify the first "in progress" and last "done" timestamps
4. Calculate velocity changes throughout the lifecycle
5. Create a visualization-ready dataset of the issue's journey

### 6. Status Cycling Detection

The function should:
1. Build a directed graph of status transitions
2. Identify cycles in the graph (where an issue returns to a previous status)
3. Count revisits for each status
4. Calculate total number of "backward" transitions
5. Flag issues with excessive cycling as potential indicators of rework or unclear requirements

### 7. Blocked Time Assessment

The function should:
1. Identify all periods when the issue was in a "Blocked" or "On Hold" status
2. Calculate total blocked time in business days
3. Analyze comments during blocked periods to extract blocking reasons
   - Look for comments that coincide with blocked status transitions
   - Apply natural language processing to identify explanation patterns
   - Categorize common blocking reasons (dependencies, technical issues, awaiting decisions)
4. Assess impact of blocked time on overall duration

## Integration with Other Components

The Duration Assessment should be designed to:
1. Provide data that complements the Continuity Analysis
2. Feed into the overall issue quality assessment
3. Contribute metrics that can be used for trend analysis across multiple issues

## Edge Cases and Special Considerations

1. **Incomplete Lifecycle Issues**
   - Handle issues that haven't reached "done" status yet
   - Provide partial analysis with clear indication of in-progress status

2. **Status Scheme Changes**
   - Account for projects where status schemes changed during the issue lifecycle
   - Map old statuses to new ones for consistent analysis

3. **Irregular Workflows**
   - Handle non-standard workflows or status transitions
   - Identify but don't penalize intentional workflow exceptions

4. **Missing Data**
   - Gracefully handle issues with incomplete changelog data
   - Provide partial analysis where full history isn't available

## Output Structure

```typescript
interface DurationAssessment {
  inProgressDays: number | null; // Business days from first "in progress" to last "done"
  exceedsSprint: boolean; // Whether issue spans multiple sprints
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
}
```

## Testing Approach

1. **Unit Testing**
   - Create test fixtures with predefined changelog data
   - Test each calculation function independently
   - Verify correct handling of different status patterns

2. **Integration Testing**
   - Test with real-world issue data examples
   - Verify integration with other analysis components

3. **Edge Case Testing**
   - Test with incomplete issues
   - Test with issues that have unusual workflow patterns
   - Test with issues that have missing changelog data

## Performance Considerations

1. Optimize the changelog parsing logic, as this can be intensive for long-lived issues
2. Consider caching intermediate results if the analysis is performed repeatedly
3. Use efficient date manipulation libraries to handle business day calculations

## Future Enhancements

1. Compare issue duration against similar issues based on type, component, or complexity
2. Incorporate team velocity data for more meaningful story point analysis
3. Add machine learning capabilities to predict issue duration based on historical patterns
4. Develop visualization components to represent issue lifecycle graphically 