# Early Issue Analysis Integration: Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for integrating Jira issue analysis capabilities earlier in the issue creation wizard flow. Currently, analysis happens late in the process or after issue creation. By integrating analysis during field completion, we can provide real-time feedback and recommendations to improve issue quality.

A key focus area is handling custom fields like acceptance criteria (commonly `customfield_11800` but configurable) when they're not available in all projects, ensuring consistent quality standards regardless of project configuration.

## Phase 1: Core Infrastructure (2 weeks)

### 1.1. Create Functional Adapters for Analyzable Content

#### Implementation Steps:
1.1.1 Implement adapter functions in `src/jira/services/analyzeIssue/adapters/contentAccessors.ts`
    *   **1.1.1.1. Define Independent Accessor Functions:** Based on existing analysis functions and following the pattern in helperFunctions.txt, create a set of pure functions that can extract data from different sources (JiraIssue, WizardState). These functions should access at least the following data points:
        *   `getKey(source): string`
        *   `getProjectId(source): string`
        *   `getIssueTypeName(source): string` (Mandatory, doesn't need to be checked unless you see fit to check)
        *   `getIssueTypeId(source): string` (Mandatory, doesn't need to be checked)
        *   `getStatusName(source): string` (For new issues, this will be automatically set based on the workflow of the project)
        *   `getStatusId(source): string` (For new issues, this will be automatically set based on the workflow of the project)
        *   `getCreatedDate(source): string` (Automatic field, does not need to be considered)
        *   `getUpdatedDate(source): string` (Automatic field, does not need to be considered)
        *   `getParentId(source): string | null`
        *   `getParentKey(source): string | null`
        *   `getAssigneeId(source): string | null` (Is not needed for new issues)
        *   `getAssigneeName(source): string | null` (Is not needed for new issues) 
        *   `getResolutionId(source): string | null` (Is not needed for new issues)
        *   `getResolutionName(source): string | null` (Is not needed for new issues)
        *   `getResolutionDate(source): string | null` (Is not needed for new issues)
        *   `getCreatorId(source): string | null`
        *   `getCreatorName(source): string | null`
        *   `getReporterId(source): string | null`
        *   `getPriorityId(source): string | null` (Is not needed for new issues)
        *   `getPriorityName(source): string | null` (Is not needed for new issues)
        *   `getInvestmentTypeId(source): string | null`
        *   `getInvestmentTypeName(source): string | null`
        *   `getStoryPoints(source): number | null` (e.g., `customfield_10105`)
        *   `getBugOriginId(source): string | null` (e.g., `customfield_14716`)
        *   `getBugOriginName(source): string | null` (e.g., `customfield_14716`)
        *   `getSummary(source): string | null`
        *   `getThirdPartyIssue(source): string | null` (e.g., `customfield_16233`)
        *   `getProductCategory(source): string | null` (e.g., `customfield_16249`)
        *   `getPriorityScore(source): number | null` (e.g., `customfield_14945`)
        *   `getEffortPoints(source): number | null` (e.g., `customfield_16279`)
        *   `getProductNameId(source): string | null` (e.g., `customfield_13800`)
        *   `getDescription(source): ADFDocument | string | null`
        *   `getAcceptanceCriteria(source): ADFDocument | string | null` (e.g., `customfield_11800`)
        *   `getLabels(source): string[] | null` (Is not needed for new issues)
        *   `getComponents(source): Array<{ id: string, name: string }> | null`
        *   `getFixVersions(source): Array<{ id: string, name: string }> | null` (Is not needed for new issues)
1.1.2. Create source-specific adapter functions in `src/jira/services/analyzeIssue/adapters/wizardStateAdapter.ts`
    *   **1.1.2.1. Implement Mapping Functions:** Create adapter functions that map between WizardState and the format expected by the accessor functions, following functional programming principles
    *   **1.1.2.2. Use Function Composition:** Leverage function composition to create pipelines for transforming data rather than monolithic transformers
    *   **1.1.2.3. Handle Partial Data:** Add special handling for incomplete wizard state data, with appropriate default values or fallbacks
1.1.3. Modify existing analysis functions to work with these accessor functions
    *   **1.1.3.1. Identify Target Analysis Functions:**
        *   Search within `src/jira/services/analyzeIssue/` and its subdirectories like `completenessEvaluation/` (e.g., `checkSummaryQuality`, `evaluateDescriptionCompleteness`, `checkAcceptanceCriteria`) 
        *   Key modules to focus on first: `getCompletenessEvaluation.ts`, `getMetadataAssessment.ts`, and `getComplexityAnalysis.ts`
        *   List all functions that will need to be updated to use the new accessor functions
    *   **1.1.3.2. Refactor Function Implementations:**
        *   Replace direct property access (e.g., `issue.fields.description`) with calls to accessor functions (e.g., `getDescription(content)`)
        *   Handle potential `null`/`undefined` returns from accessor functions gracefully (e.g., using `??` or conditional checks) for incomplete wizard data
    *   **1.1.3.3. Utilize Function Currying:**
        *   Where appropriate, implement partial application to create specialized versions of analysis functions that work with specific data sources
        *   This allows for more flexibility and better composition without sacrificing type safety
    *   **1.1.3.4. Maintain Pure Functions:**
        *   Ensure analysis functions remain pure (no side effects) to facilitate testing and composability
        *   Use immutable data patterns when processing analysis results
    *   **1.1.3.5. Update Unit Tests:**
        *   Modify tests to use the accessor functions with both JiraIssue and WizardState data sources
        *   Test scenarios with both complete and incomplete data
    *   **1.1.3.6. Incremental Pilot:** Consider refactoring one simple analysis function first to validate the functional approach before broader application
1.1.4. Add unit tests for adapter functions
    *   **1.1.4.1. Test Coverage Requirements:**
        *   Aim for 100% test coverage of new adapter functions
        *   Test handling of edge cases like missing fields and unexpected input formats
        *   Include specific tests for all custom field mappings
1.1.5. Extract and reuse logic from `src/jira/services/analyzeIssue/completenessEvaluation/checkAcceptanceCriteria.ts`
    *   **1.1.5.1. Function Extraction Strategy:** Extract the core logic from `checkAcceptanceCriteria.ts` into small, focused, pure functions that can be composed and reused by both the original function and the new analysis flow
    *   **1.1.5.2. Improve Pattern Detection:** Based on the implementation in `checkAcceptanceCriteria.ts`, refine the pattern detection approach to better handle partial data during issue creation

#### Testing Strategy:
- **Unit Tests**:
  - Verify accessor functions work correctly with different data sources:
    *   Test with JiraIssue objects
    *   Test with WizardState objects
    *   Test with partial data
  - Test function composition patterns
  - Ensure existing analysis functions work with the adapters (producing identical results for equivalent input)
- **Validation Criteria**:
  - Accessor functions should handle missing/optional fields gracefully
  - Analysis functions should work identically with both data sources
  - No duplication of existing field evaluation logic
  - Functions should follow pure functional programming principles

#### Identified Risks and Mitigations:
- **Risk**: Complex custom field mapping between JiraIssue and WizardState
  - **Mitigation**: Create a robust mapping configuration system with fallbacks
- **Risk**: Inconsistent field formats between wizard state and Jira API responses
  - **Mitigation**: Add format normalization functions for key data types (dates, rich text, etc.)
- **Risk**: Performance impact from function composition and multiple accessor calls
  - **Mitigation**: Implement memoization for expensive accessor operations

### 1.2. Create Simplified Custom Field Handling

#### Implementation Steps:
1.2.1. Create a mapping utility for custom fields in `src/jira/services/analyzeIssue/adapters/customFieldMap.ts`
    *   **1.2.1.1. Dynamic Field Discovery:** Implement functions to dynamically identify custom fields based on project configuration
    *   **1.2.1.2. Map Common Custom Fields:** Focus on frequently used fields (acceptance criteria, story points)
    *   **1.2.1.3. Create Fallback Strategy:** Implement logic to handle cases where expected fields are not available
1.2.2. Implement acceptance criteria field identification
    *   **1.2.2.1. Field Detection Heuristics:** Use pattern matching and metadata to identify acceptance criteria fields across different projects
    *   **1.2.2.2. Content Extraction Strategy:** Create extractors that work with both ADF (Atlassian Document Format) and plain text formats
1.2.3. Implement field conversion utilities for ADF format
    *   **1.2.3.1. ADF Parser Functions:** Create lightweight utilities to extract meaningful text from ADF documents
    *   **1.2.3.2. Text-to-ADF Conversion:** Add basic functions to convert plain text inputs to valid ADF format
1.2.4. Add configuration options in `src/jira/services/analyzeIssue/config.ts`
    *   **1.2.4.1. Field ID Configuration:** Allow customization of field mapping through configuration
    *   **1.2.4.2. Project-Specific Settings:** Support project-specific analysis rules

#### Testing Strategy:
- **Unit Tests**:
  - Test field identification with different project configurations
  - Verify fallback behavior works correctly
  - Test ADF parsing and generation
- **Validation Criteria**:
  - System should correctly identify common custom fields
  - Fallback logic should provide good default behavior
  - Should be easily modifiable for future expansion

#### Identified Risks and Mitigations:
- **Risk**: Custom fields vary significantly across Jira instances
  - **Mitigation**: Design flexible field detection that can adapt to different naming conventions
- **Risk**: ADF parsing complexity and potential format changes
  - **Mitigation**: Design parsers to be tolerant of format variations and maintain a test suite with different ADF examples

### 1.3. Create Analysis Service with Performance Optimization

#### Implementation Steps:
1.3.1. Create `src/jira/services/analyzeIssue/wizardAnalysis/analysisService.ts`
    *   **1.3.1.1. Service Architecture:** Design the service using functional programming principles
    *   **1.3.1.2. Prioritized Analysis:** Implement a system to prioritize analysis types based on available data
1.3.2. Implement debounced analysis execution
    *   **1.3.2.1. Debounce Strategy:** Create utility functions for debounced analysis execution
    *   **1.3.2.2. Configuration Options:** Allow customization of debounce timing
1.3.3. Add caching mechanism for unchanged fields
    *   **1.3.3.1. Dependency Tracking:** Track dependencies between fields and invalidate cache when dependencies change
    *   **1.3.3.2. Cache Implementation:** Use immutable data structures for efficient change detection
1.3.4. Leverage existing `src/jira/api/fieldMetadataCache.ts` for field metadata caching
    *   **1.3.4.1. Integration Strategy:** Create adapter functions to access cached metadata
    *   **1.3.4.2. Cache Invalidation:** Implement logic to refresh cached metadata when needed

#### Testing Strategy:
- **Unit Tests**:
  - Test caching behavior with changing and unchanged fields
  - Measure performance with various wizard states
  - Test debounce timing with simulated rapid changes
- **Validation Criteria**:
  - Analysis should complete within 200ms for standard fields
  - Caching should provide performance improvement for unchanged fields
  - System should correctly handle field dependencies

#### Identified Risks and Mitigations:
- **Risk**: Excessive analysis during rapid field edits causing performance issues
  - **Mitigation**: Implement progressive analysis with prioritized fields and granular debouncing
- **Risk**: Memory leaks from improper cache management
  - **Mitigation**: Implement cache size limits and expiration policies

### 1.4. Update WizardState Interface

#### Implementation Steps:
1.4.1. Modify `src/tools/issueCreationWizard/types.ts`
    *   **1.4.1.1. Interface Expansion:** Extend the WizardState interface to support detailed analysis results
    *   **1.4.1.2. Type Safety:** Use TypeScript utility types for better type safety
1.4.2. Implement normalized analysis state structure
    *   **1.4.2.1. Normalization Strategy:** Design a consistent structure for analysis results
    *   **1.4.2.2. Version Control:** Add versioning to the analysis data structure to handle future format changes
1.4.3. Use TypeScript utility types for optional analysis fields
    *   **1.4.3.1. Type Definitions:** Create utility types for different analysis components
    *   **1.4.3.2. Type Guards:** Implement type guards for runtime type checking
1.4.4. Add comprehensive documentation
    *   **1.4.4.1. JSDoc Comments:** Document all interface members with clear JSDoc comments
    *   **1.4.4.2. Usage Examples:** Include code examples in documentation

#### Testing Strategy:
- **Compilation Tests**:
  - Verify code compiles with updated interface
  - Check for type errors
- **Validation Criteria**:
  - Type definitions should be backward compatible
  - State structure should be optimized for performance
  - Documentation should be complete and accurate

#### Identified Risks and Mitigations:
- **Risk**: Breaking changes to existing code using WizardState
  - **Mitigation**: Create migration utilities and maintain backward compatibility
- **Risk**: Growth of state size impacting performance
  - **Mitigation**: Design analysis data structure to be compact and use reference equality for unchanged sections

## Phase 2: Tool Enhancements (2 weeks)

### 2.1. Enhance Tool Parameter Design

#### Implementation Steps:
2.1.1. Create analysis option types in `src/tools/issueCreationWizard/types.ts`
    *   **2.1.1.1. Parameter Design:** Design flexible parameter structures using TypeScript interfaces
    *   **2.1.1.2. Default Values:** Define sensible defaults for all parameters
2.1.2. Modify `src/tools/issueCreationWizard/mcp/toolDefinitions/updateFieldsWizardTool.ts`
    *   **2.1.2.1. Schema Updates:** Add analysis control parameters to the tool schema
    *   **2.1.2.2. Parameter Validation:** Implement validation logic for new parameters
2.1.3. Add analysis control parameters with sensible defaults
    *   **2.1.3.1. Progressive Analysis:** Design parameters that support progressive analysis detail
    *   **2.1.3.2. Feature Flags:** Add feature flags to enable/disable specific analysis features

#### Testing Strategy:
- **Schema Validation**:
  - Verify tool schema correctly includes new parameters
  - Test parameter validation with various inputs
  - Ensure backward compatibility with existing tool calls
- **Validation Criteria**:
  - Parameters should provide necessary control
  - Default values should ensure correct behavior without explicit configuration
  - Schema should be well-documented for tool users

#### Identified Risks and Mitigations:
- **Risk**: Parameter complexity making the tool difficult to use
  - **Mitigation**: Implement smart defaults and clear documentation
- **Risk**: Schema changes breaking existing tool usages
  - **Mitigation**: Ensure all parameters are optional with sensible defaults

### 2.2. Update updateFieldsWizardToolExecutor

#### Implementation Steps:
2.2.1. Modify `src/tools/issueCreationWizard/mcp/updateFieldsExecutor.ts`
    *   **2.2.1.1. Integration Strategy:** Design clean integration points for analysis service
    *   **2.2.1.2. Error Handling:** Implement robust error handling to prevent failures
2.2.2. Integrate with analysis service
    *   **2.2.2.1. Service Injection:** Use dependency injection to integrate the analysis service
    *   **2.2.2.2. Execution Flow:** Design the execution flow to maintain performance
2.2.3. Implement field-specific analysis triggering
    *   **2.2.3.1. Field Change Detection:** Create utilities to detect meaningful field changes
    *   **2.2.3.2. Analysis Scoping:** Implement scoped analysis based on field dependencies
2.2.4. Add error handling
    *   **2.2.4.1. Error Recovery:** Implement strategies to recover from analysis errors
    *   **2.2.4.2. Logging:** Add detailed logging for troubleshooting
2.2.5. Leverage `src/tools/issueCreationWizard/mcp/fieldProcessor.ts` for integration
    *   **2.2.5.1. Extension Points:** Identify and use existing extension points
    *   **2.2.5.2. Code Reuse:** Reuse existing validation and processing logic

#### Testing Strategy:
- **Unit Tests**:
  - Test executor with different field combinations
  - Test error handling
  - Test performance with simulated heavy loads
- **Validation Criteria**:
  - Executor should handle analysis errors gracefully
  - Performance should be acceptable for interactive use
  - Integration should maintain existing functionality

#### Identified Risks and Mitigations:
- **Risk**: Error propagation causing tool failures
  - **Mitigation**: Implement multi-level error handling with graceful degradation
- **Risk**: Performance degradation affecting user experience
  - **Mitigation**: Implement performance monitoring and adaptive analysis depth

### 2.3. Create Analysis Matrix for Wizard Steps

#### Implementation Steps:
2.3.1. Create `src/tools/issueCreationWizard/analysis/analysisMatrix.ts`
    *   **2.3.1.1. Matrix Design:** Create a data structure mapping wizard steps to appropriate analysis types
    *   **2.3.1.2. Configuration Options:** Support customization through configuration
2.3.2. Define appropriate analysis types for each wizard step
    *   **2.3.2.1. Progressive Analysis:** Implement increasingly comprehensive analysis through wizard steps
    *   **2.3.2.2. Context Sensitivity:** Add context-aware analysis based on project and issue type
2.3.3. Implement progressive disclosure rules
    *   **2.3.3.1. Disclosure Strategy:** Define rules for when to show analysis results
    *   **2.3.3.2. Feedback Design:** Design user-friendly feedback mechanisms

#### Testing Strategy:
- **Unit Tests**:
  - Test matrix with different wizard steps
  - Verify appropriate analysis selection
  - Test with various project and issue type combinations
- **Validation Criteria**:
  - Matrix should provide appropriate analysis for each step
  - Analysis scope should increase progressively through steps
  - System should adapt to different project contexts

#### Identified Risks and Mitigations:
- **Risk**: Inappropriate analysis for specific contexts
  - **Mitigation**: Implement context detection and adaptive analysis selection
- **Risk**: Information overload for users
  - **Mitigation**: Design progressive disclosure mechanism based on user journey

### 2.4. Create and Implement analyzeWizardStateTool

#### Implementation Steps:
2.4.1. Create `src/tools/issueCreationWizard/mcp/toolDefinitions/analyzeWizardStateTool.ts`
    *   **2.4.1.1. Tool Definition:** Define the tool schema following MCP conventions
    *   **2.4.1.2. Parameter Design:** Design flexible parameters for targeted analysis
2.4.2. Implement parameter schema for targeted analysis
    *   **2.4.2.1. Targeting Options:** Support analysis of specific fields or categories
    *   **2.4.2.2. Depth Control:** Allow configuration of analysis depth
2.4.3. Create `src/tools/issueCreationWizard/mcp/analyzeStateExecutor.ts`
    *   **2.4.3.1. Executor Design:** Implement the executor following functional programming principles
    *   **2.4.3.2. Result Formatting:** Define consistent result formatting
2.4.4. Integrate with analysis service and matrix
    *   **2.4.4.1. Service Integration:** Connect to the analysis service
    *   **2.4.4.2. Matrix Consultation:** Use the analysis matrix for contextual decisions
2.4.5. Implement error handling with fallbacks
    *   **2.4.5.1. Error Strategies:** Define strategies for handling different error types
    *   **2.4.5.2. Fallback Implementation:** Create degraded analysis modes for error cases
2.4.6. Add unit tests
    *   **2.4.6.1. Test Coverage:** Achieve high test coverage for the new tool
    *   **2.4.6.2. Edge Cases:** Test unusual or boundary conditions

#### Testing Strategy:
- **Unit Tests**:
  - Test with various wizard states and parameters
  - Test error handling and fallbacks
  - Test performance with complex wizard states
- **Validation Criteria**:
  - Tool should work with partial wizard states
  - Analysis should degrade gracefully when data is missing
  - Results should be consistent with full issue analysis

#### Identified Risks and Mitigations:
- **Risk**: Tool complexity making it difficult to use
  - **Mitigation**: Provide example usages and clear documentation
- **Risk**: Performance issues with complex analysis
  - **Mitigation**: Implement tiered analysis with configurable depth

### 2.5. Register and Integrate New Tools

#### Implementation Steps:
2.5.1. Update `src/tools/issueCreationWizard/mcp/index.ts` to register new tools
    *   **2.5.1.1. Registration Process:** Follow standard MCP tool registration process
    *   **2.5.1.2. Compatibility Check:** Ensure compatibility with existing tools
2.5.2. Update documentation
    *   **2.5.2.1. Tool Documentation:** Create comprehensive documentation for new tools
    *   **2.5.2.2. Example Usage:** Provide example usage scenarios
2.5.3. Implement integration tests
    *   **2.5.3.1. Integration Test Suite:** Create tests for tool interactions
    *   **2.5.3.2. Regression Testing:** Ensure existing functionality remains intact

#### Testing Strategy:
- **Integration Tests**:
  - Test tool registration and discovery
  - Test tool interactions
  - Test with real-world usage scenarios
- **Validation Criteria**:
  - Tools should be discoverable through MCP
  - Documentation should be complete and accurate
  - Integration should maintain existing functionality

#### Identified Risks and Mitigations:
- **Risk**: Tool conflicts or namespace issues
  - **Mitigation**: Use consistent naming conventions and test for conflicts
- **Risk**: Backward compatibility issues
  - **Mitigation**: Maintain compatibility with existing tool contracts