# Jira Issue Creation Wizard: Detailed Implementation Steps

This document outlines a comprehensive, iterative approach to implementing the Jira Issue Creation Wizard. Each phase builds upon the previous one, with clear testing checkpoints before proceeding to the next stage.

## Phase 1: Core Infrastructure (Weeks 1-2)

### 1.1. State Management Module ✅ COMPLETED
- **1.1.1.** Create `WizardState` interface and `WizardStep` enum in `types.ts`
- **1.1.2.** Implement `StateManager` class with singleton pattern
  - Add getter/setter methods for state
  - Implement state validation functions
  - Add state transition guards
- **1.1.3.** Create in-memory storage mechanism
- **1.1.4.** Write unit tests for state management
- **1.1.5.** Implement state serialization/deserialization
- **1.1.6.** Test Checkpoint: Verify state transitions work correctly

### 1.2. MCP Tool Definitions ✅ COMPLETED
- **1.2.1.** Create basic tool definition structure following MCP conventions
- **1.2.2.** Define tool schemas for:
  - `mcp_IssueCreationWizard_getState`
  - `mcp_IssueCreationWizard_getStatus`
  - `mcp_IssueCreationWizard_resetState`
  - `mcp_IssueCreationWizard_updateState`
  - `mcp_IssueCreationWizard_createIssue`
- **1.2.3.** Implement parameter validation
- **1.2.4.** Create stub implementations that return mock data
- **1.2.5.** Write tests for tool definition validation
- **1.2.6.** Test Checkpoint: Verify tools are properly defined

### 1.3. MCP Integration ✅ COMPLETED
- **1.3.1.** Create tool registration module
- **1.3.2.** Integrate with existing MCP registry
- **1.3.3.** Set up configuration options
- **1.3.4.** Implement proper error handling
- **1.3.5.** Write tests for tool registration
- **1.3.6.** Test Checkpoint: Verify tools are discoverable in MCP

## Phase 2: Jira API Integration (Weeks 3-4)

### 2.1. Project Retrieval ✅ COMPLETED
- **2.1.1.** Create API client for fetching Jira projects
- **2.1.2.** Implement response transformation
- **2.1.3.** Add error handling
- **2.1.4.** Implement caching mechanism
- **2.1.5.** Write unit tests with mock responses
- **2.1.6.** Create integration tests with test Jira instance
- **2.1.7.** Test Checkpoint: Verify projects can be retrieved

### 2.2. Issue Type Retrieval ✅ COMPLETED
- **2.2.1.** Create API client for fetching issue types
- **2.2.2.** Implement response transformation 
- **2.2.3.** Add error handling
- **2.2.4.** Write unit tests with mock responses
- **2.2.5.** Create integration tests
- **2.2.6.** Test Checkpoint: Verify issue types can be retrieved for projects

### 2.3. Field Metadata Retrieval ✅ COMPLETED
- **2.3.1.** Create API client for fetching field metadata
- **2.3.2.** Implement field type detection and categorization
- **2.3.3.** Add support for custom fields
- **2.3.4.** Create transformers for complex field types
- **2.3.5.** Write unit tests with mock metadata
- **2.3.6.** Create integration tests
- **2.3.7.** Test Checkpoint: Verify field metadata can be retrieved

### 2.4. Issue Creation API ✅ COMPLETED
- **2.4.1.** Create API client for issue creation
- **2.4.2.** Implement field validation
- **2.4.3.** Add error handling
- **2.4.4.** Create response parsers
- **2.4.5.** Write unit tests
- **2.4.6.** Create integration tests
- **2.4.7.** Test Checkpoint: Verify basic issue creation works

## Phase 3: Wizard Flow Implementation (Weeks 5-6)

### 3.1. Initialize Wizard Tool ✅ COMPLETED
- **3.1.1.** Complete implementation of `getStatus` tool
- **3.1.2.** Add validation for existing wizards
- **3.1.3.** Implement proper error responses
- **3.1.4.** Create unit tests
- **3.1.5.** Create integration tests
- **3.1.6.** Test Checkpoint: Verify wizard initialization works

### 3.2. Project Selection Tool ✅ COMPLETED
- **3.2.1.** Complete implementation of project selection
- **3.2.2.** Connect to Jira API client
- **3.2.3.** Update wizard state with selected project
- **3.2.4.** Implement validation
- **3.2.5.** Write unit tests
- **3.2.6.** Create integration tests
- **3.2.7.** Test Checkpoint: Verify project selection updates state

### 3.3. Issue Type Selection Tool ✅ COMPLETED
- **3.3.1.** Complete implementation of issue type selection
- **3.3.2.** Connect to Jira API client
- **3.3.3.** Update wizard state with selected issue type
- **3.3.4.** Implement validation
- **3.3.5.** Write unit tests
- **3.3.6.** Create integration tests
- **3.3.7.** Test Checkpoint: Verify issue type selection works

### 3.4. Field Management Tools ✅ COMPLETED
- **3.4.1.** Implement field data collection
- **3.4.2.** Create validation rules by field type
- **3.4.3.** Update wizard state with field values
- **3.4.4.** Implement field dependency handling
- **3.4.5.** Write unit tests
- **3.4.6.** Create integration tests
- **3.4.7.** Test Checkpoint: Verify field data collection works

### 3.4.8. Enhance Field Validation for Allowed Values ✅ COMPLETED
- **3.4.8.1.** Create `validateAllowedValues` function in `src/tools/issueCreationWizard/mcp/validators/allowedValuesValidator.ts`
  - Implement object ID validation (e.g., `{ id: '4' }`)
  - Add array element validation
  - Support string/primitive value validation
  - Add descriptive error messages
- **3.4.8.2.** Modify `typeValidator.ts` to integrate allowedValues validation
  - Update `validateFieldTypeAndFormat` to include allowedValues check
  - Create specialized validators for different field types (option, user, etc.)
- **3.4.8.3.** Update field presentation in application UI
  - Clearly display available options for each field
  - Show validation errors for invalid selections
  - Implement field option filtering/searching for large option sets
- **3.4.8.4.** Create unit tests for allowedValues validation in `__tests__/allowedValuesValidator.test.ts`
  - Test each field type with valid and invalid values
  - Test edge cases (empty allowedValues, null values, etc.)
  - Test multi-value and complex field types
- **3.4.8.5.** Update manual test script to verify allowedValues validation
  - Add test cases with valid and invalid field values
  - Verify error messages are appropriate and helpful
  - Test with real Jira field configurations
- **3.4.8.6.** Document validation approach and error handling
  - Create documentation for field type validation rules
  - Document error message patterns and troubleshooting
- **3.4.8.7.** Test Checkpoint: Verify allowedValues validation prevents invalid submissions

### 3.5. State Transition Logic
- **3.5.1.** Implement state machine for wizard flow
- **3.5.2.** Add validation for step transitions
- **3.5.3.** Create guards for invalid state changes
- **3.5.4.** Add completion checking
- **3.5.5.** Write unit tests
- **3.5.6.** Create integration tests
- **3.5.7.** Test Checkpoint: Verify full wizard flow works

## Phase 4: Analysis Integration and Advanced Features (Weeks 7-8)

### 4.1. Integrated Analysis with MCP Prompts
- **4.1.1.** Create analysis prompt templates using MCP Prompts architecture
  - Define prompt structure with name, description and required arguments
  - Create specialized prompts for different issue types (story, bug, epic, task)
  - Implement dynamic prompt generation based on wizard state
- **4.1.2.** Implement transformers between wizard state and Jira format
- **4.1.3.** Implement new-issue-specific analysis functions
  - Create `getMetadataAssessment` adapter for new issues
  - Create `getComplexityAnalysis` adapter for new issues
  - Create `getCompletenessEvaluation` adapter for new issues
  - Create modified `getDependenciesAnalysis` for potential dependencies
  - Skip `getDurationAssessment` and `getContinuityAnalysis` for new issues
- **4.1.4.** Add incremental analysis during field completion
  - Implement progressive analysis as fields are completed
  - Provide real-time feedback on field quality
  - Surface appropriate prompt templates based on current state
- **4.1.5.** Implement comprehensive analysis for review
  - Create unified analysis results from individual assessments
  - Generate overall quality score
  - Provide specific improvement recommendations
- **4.1.6.** Integrate Agile/Scrum best practice recommendations
  - Implement guidance generation based on issue type
  - Add quality suggestion logic with contextual examples
  - Create improvement recommendations tied to analysis results
  - Implement quality indicators with clear visual feedback
- **4.1.7.** Write unit tests
  - Test each analysis function in isolation
  - Test prompt template generation
  - Test transformations between formats
  - Verify guidance quality meets standards
- **4.1.8.** Create integration tests
  - Test analysis with sample data
  - Verify prompt chaining works correctly
  - Test with mock Jira responses
- **4.1.9.** Test Checkpoint: Verify analysis works with partial data and follows best practices

### 4.2. Field-Specific Validation ✅ COMPLETED
- **4.2.1.** Implement validation for user stories
- **4.2.2.** Add validation for bug reports
- **4.2.3.** Create validation for epics
- **4.2.4.** Implement validation for tasks
- **4.2.5.** Write unit tests
- **4.2.6.** Create integration tests
- **4.2.7.** Test Checkpoint: Verify issue-type-specific validation works

### 4.3. Prompt-Based Workflow Enhancement
- **4.3.1.** Implement multi-step workflow prompts
  - Create guided prompt sequences for issue creation
  - Implement context-aware follow-up prompts
  - Add dynamic content embedding in prompts
- **4.3.2.** Create UI integrations for prompts
  - Implement slash command suggestions
  - Add quick actions based on analysis
  - Create context menu integrations
- **4.3.3.** Implement prompt discovery mechanism
  - Create prompt catalog service
  - Add search and filtering capabilities
  - Implement versioning for prompt templates
- **4.3.4.** Add contextual help prompts
  - Create error resolution prompts
  - Add field completion assistance
  - Implement example generation
- **4.3.5.** Write unit tests
  - Test prompt template validation
  - Test prompt discovery
  - Test workflow sequences
- **4.3.6.** Create integration tests
  - Test prompt-based workflows
  - Verify UI integrations
  - Test with different user scenarios
- **4.3.7.** Test Checkpoint: Verify prompt-based workflows enhance user experience

### 4.4. Issue Creation and Results
- **4.4.1.** Complete issue creation implementation
- **4.4.2.** Add error handling
- **4.4.3.** Implement result formatting
- **4.4.4.** Create success/failure messaging
- **4.4.5.** Write unit tests
- **4.4.6.** Create integration tests
- **4.4.7.** Test Checkpoint: Verify end-to-end issue creation works

## Phase 5: Refinement and Comprehensive Testing (Weeks 9-10)

### 5.1. Performance Optimization
- **5.1.1.** Implement response caching
- **5.1.2.** Add batch validation
- **5.1.3.** Optimize state transitions
- **5.1.4.** Improve analysis performance
- **5.1.5.** Conduct performance testing
- **5.1.6.** Document optimizations
- **5.1.7.** Test Checkpoint: Verify performance meets requirements

### 5.2. Error Handling Enhancements
- **5.2.1.** Add comprehensive error recovery
- **5.2.2.** Implement detailed error messages
- **5.2.3.** Create graceful fallbacks
- **5.2.4.** Add user guidance
- **5.2.5.** Test with simulated failures
- **5.2.6.** Document error handling
- **5.2.7.** Test Checkpoint: Verify robust error handling

### 5.3. Edge Case Handling
- **5.3.1.** Handle large datasets
- **5.3.2.** Support complex custom fields
- **5.3.3.** Address field dependencies
- **5.3.4.** Test unusual configurations
- **5.3.5.** Document edge case handling
- **5.3.6.** Test Checkpoint: Verify edge cases are handled properly

### 5.4. End-to-End Testing
- **5.4.1.** Create comprehensive test suites
- **5.4.2.** Test full wizard flows
- **5.4.3.** Verify analysis results
- **5.4.4.** Test with realistic configurations
- **5.4.5.** Document test coverage
- **5.4.6.** Test Checkpoint: Verify system works end-to-end

### 5.5. Documentation
- **5.5.1.** Create usage documentation
- **5.5.2.** Add examples
- **5.5.3.** Document interfaces
- **5.5.4.** Create troubleshooting guide
- **5.5.5.** Prepare release notes
- **5.5.6.** Final Checkpoint: Verify documentation is complete

## Testing Strategy

### Unit Testing
- Test state management in isolation
- Mock Jira API responses
- Test tool parameter validation
- Test state transitions
- Test field validation logic
- Test analysis transformations
- Use snapshot testing for complex objects

### Integration Testing
- Test tool registration with MCP server
- Test state management with tools
- Test Jira API integration with mock server
- Test wizard flow with simulated user actions
- Test error handling across components

### End-to-End Testing
- Test complete wizard flows
- Test with actual Jira test instance
- Verify created issues match expectations
- Test with various issue types and field configurations
- Test error scenarios and recovery

### Performance Testing
- Measure response times for each tool
- Test with large datasets
- Verify caching effectiveness
- Identify and address bottlenecks
- Document performance characteristics

## Development Workflow

### Version Control
- Create feature branches for each phase
- Use descriptive commit messages
- Require code reviews before merging
- Tag stable versions

### Code Quality
- Follow existing code style
- Use TypeScript strict mode
- Add comprehensive comments
- Maintain high test coverage (>90%)
- Use linting and automated checks

### Dependency Management
- Document external dependencies
- Minimize new dependencies
- Use explicit versioning
- Update dependencies regularly

### Continuous Integration
- Set up automated testing
- Implement coverage reporting
- Add linting to CI pipeline
- Create deployment workflow

## Implementation Notes

1. Each checkpoint represents a stable, testable milestone
2. Do not proceed to the next step until tests pass
3. Document any deviations from the plan
4. Update this plan as implementation progresses
5. Maintain backward compatibility with existing MCP tools
6. Follow existing code patterns and conventions
7. Prioritize reliability over new features 