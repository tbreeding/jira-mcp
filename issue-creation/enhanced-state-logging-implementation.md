# Enhanced State Management Logging Implementation Plan ✅ COMPLETED

This document outlines the detailed steps to implement enhanced state management logging for the Jira Issue Creation Wizard, addressing the "No active wizard found" error and improving overall debugging capabilities.

## 1. Understanding the Current Structure

Before implementing logging enhancements, we need to identify key components in the existing codebase:

### State Management Components
- `WizardState` interface (likely in `types.ts`)
- `StateManager` class (managing wizard state)
- State transition functions
- Validation utilities
- MCP tool implementations that interact with the state

### Current Error Sources
Based on the "No active wizard found" error, we should focus on:
- Initialization sequence
- State persistence
- State validation
- Tool execution preconditions

## 2. Creating a Structured Logging Framework

### 2.1 Create Logger Utility Module

```typescript
// src/tools/issueCreationWizard/logging/logger.ts

import { WizardState, WizardStep } from '../types';
import { Server } from '@modelcontextprotocol/sdk/server';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export interface LogContext {
  wizardId?: string;
  operation?: string;
  currentStep?: WizardStep;
  duration?: number;
  stateSnapshot?: Partial<WizardState>;
  transitionType?: string;
  errorContext?: Record<string, any>;
}

export class WizardLogger {
  private server?: Server;
  private logLevel: LogLevel = LogLevel.INFO;
  
  constructor(options?: { server?: Server, logLevel?: LogLevel }) {
    this.server = options?.server;
    this.logLevel = options?.logLevel || LogLevel.INFO;
  }
  
  // Core logging methods
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }
  
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  trace(message: string, context?: LogContext): void {
    this.log(LogLevel.TRACE, message, context);
  }
  
  // Main log method with structured output
  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    };
    
    // Console output
    console.error(JSON.stringify(logEntry));
    
    // Send to MCP client if server is available
    if (this.server && this.server.request_context?.session) {
      this.server.request_context.session.send_log_message(
        level,
        { message, context: logEntry }
      );
    }
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }
  
  // Helper methods for specific logging scenarios
  logStateTransition(
    operation: string,
    beforeState: Partial<WizardState>,
    afterState: Partial<WizardState>,
    duration: number
  ): void {
    this.info(`State transition: ${operation}`, {
      operation,
      duration,
      transitionType: operation,
      stateSnapshot: {
        before: this.sanitizeState(beforeState),
        after: this.sanitizeState(afterState)
      }
    });
  }
  
  logToolOperation(
    toolName: string,
    params: Record<string, any>,
    result?: any,
    error?: Error
  ): void {
    if (error) {
      this.error(`Tool operation failed: ${toolName}`, {
        operation: toolName,
        errorContext: {
          message: error.message,
          stack: error.stack,
          params
        }
      });
    } else {
      this.info(`Tool operation completed: ${toolName}`, {
        operation: toolName,
        stateSnapshot: {
          params: this.sanitizeParams(params),
          result: this.sanitizeResult(result)
        }
      });
    }
  }
  
  logError(
    operation: string,
    error: Error,
    expectedState?: any,
    actualState?: any
  ): void {
    this.error(`Error in operation: ${operation}`, {
      operation,
      errorContext: {
        message: error.message,
        stack: error.stack,
        expected: expectedState,
        actual: actualState,
        diff: this.calculateDiff(expectedState, actualState)
      }
    });
  }
  
  // Utility methods
  private sanitizeState(state: Partial<WizardState>): Partial<WizardState> {
    // Remove sensitive data, truncate large objects, etc.
    // This is a placeholder implementation
    return { ...state };
  }
  
  private sanitizeParams(params: Record<string, any>): Record<string, any> {
    // Remove sensitive data from params
    return { ...params };
  }
  
  private sanitizeResult(result: any): any {
    // Remove sensitive data from results
    return result;
  }
  
  private calculateDiff(expected: any, actual: any): Record<string, any> {
    // Simple diff implementation
    const diff: Record<string, any> = {};
    
    if (!expected || !actual) return diff;
    
    Object.keys({ ...expected, ...actual }).forEach(key => {
      if (JSON.stringify(expected?.[key]) !== JSON.stringify(actual?.[key])) {
        diff[key] = {
          expected: expected?.[key],
          actual: actual?.[key]
        };
      }
    });
    
    return diff;
  }
}

// Export singleton instance
export const logger = new WizardLogger();
```

### 2.2 Create Debug Helper Functions

```typescript
// src/tools/issueCreationWizard/logging/debugHelpers.ts

import { WizardState, WizardStep } from '../types';
import { logger } from './logger';

export interface StateHistory {
  timestamp: string;
  operation: string;
  state: Partial<WizardState>;
}

// Keep a circular buffer of recent state changes
const stateHistory: StateHistory[] = [];
const MAX_HISTORY_SIZE = 20;

export function recordStateChange(
  operation: string,
  state: Partial<WizardState>
): void {
  // Add to history
  stateHistory.unshift({
    timestamp: new Date().toISOString(),
    operation,
    state: { ...state }
  });
  
  // Trim history if needed
  if (stateHistory.length > MAX_HISTORY_SIZE) {
    stateHistory.pop();
  }
}

export function getStateHistory(): StateHistory[] {
  return [...stateHistory];
}

export function dumpCurrentState(state: Partial<WizardState>): string {
  return JSON.stringify(state, null, 2);
}

export function validateState(state: Partial<WizardState>): { 
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Basic validation
  if (!state) {
    errors.push('State is undefined');
    return { valid: false, errors };
  }
  
  // Check active flag
  if (state.active === undefined) {
    errors.push('State missing "active" property');
  }
  
  // Check current step if active
  if (state.active && !state.currentStep) {
    errors.push('Active wizard missing "currentStep" property');
  }
  
  // Validate step-specific requirements
  if (state.currentStep === WizardStep.PROJECT_SELECTION && !state.projectKey) {
    errors.push('Project selection step requires projectKey');
  }
  
  if (state.currentStep === WizardStep.ISSUE_TYPE_SELECTION && !state.issueTypeId) {
    errors.push('Issue type selection step requires issueTypeId');
  }
  
  // More validation as needed...
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function formatStateForInspector(state: Partial<WizardState>): string {
  // Create a rich text representation for MCP Inspector
  // This could include HTML, color coding, etc.
  return `
    <div class="wizard-state">
      <div class="header">Wizard State</div>
      <div class="active ${state.active ? 'active' : 'inactive'}">
        Status: ${state.active ? 'Active' : 'Inactive'}
      </div>
      <div class="step">
        Current Step: ${state.currentStep || 'N/A'}
      </div>
      <div class="details">
        ${state.projectKey ? `<div>Project: ${state.projectKey}</div>` : ''}
        ${state.issueTypeId ? `<div>Issue Type: ${state.issueTypeId}</div>` : ''}
        ${state.fields ? `<div>Fields: ${Object.keys(state.fields).length} defined</div>` : ''}
      </div>
    </div>
  `;
}
```

### 2.3 Create Error Handling Utilities

```typescript
// src/tools/issueCreationWizard/logging/errorHandling.ts

import { WizardState, WizardStep } from '../types';
import { logger } from './logger';

export class WizardError extends Error {
  public readonly expectedState?: Partial<WizardState>;
  public readonly actualState?: Partial<WizardState>;
  public readonly operation: string;
  public readonly recoverable: boolean;
  public readonly suggestions: string[];
  
  constructor(options: {
    message: string;
    operation: string;
    expectedState?: Partial<WizardState>;
    actualState?: Partial<WizardState>;
    recoverable?: boolean;
    suggestions?: string[];
  }) {
    super(options.message);
    this.name = 'WizardError';
    this.operation = options.operation;
    this.expectedState = options.expectedState;
    this.actualState = options.actualState;
    this.recoverable = options.recoverable ?? false;
    this.suggestions = options.suggestions ?? [];
    
    // Log the error automatically
    logger.logError(
      this.operation,
      this,
      this.expectedState,
      this.actualState
    );
  }
  
  static noActiveWizard(operation: string): WizardError {
    return new WizardError({
      message: `Cannot ${operation}: No active wizard found`,
      operation,
      expectedState: { active: true },
      actualState: { active: false },
      recoverable: true,
      suggestions: [
        'Initialize a new wizard with updateState and step="initiate"',
        'Check if a wizard session is already in progress and resume it',
        'Ensure the wizard state is properly persisted between operations'
      ]
    });
  }
  
  static invalidStateTransition(
    operation: string,
    fromStep: WizardStep,
    toStep: WizardStep
  ): WizardError {
    return new WizardError({
      message: `Invalid state transition in ${operation}: ${fromStep} -> ${toStep}`,
      operation,
      expectedState: { currentStep: toStep },
      actualState: { currentStep: fromStep },
      recoverable: true,
      suggestions: [
        `Complete the ${fromStep} step before proceeding to ${toStep}`,
        'Follow the proper sequence of wizard steps',
        'Reset the wizard state if you need to start over'
      ]
    });
  }
  
  static missingRequiredField(
    operation: string,
    fieldName: string,
    step: WizardStep
  ): WizardError {
    return new WizardError({
      message: `Missing required field "${fieldName}" for ${step} in ${operation}`,
      operation,
      expectedState: { [fieldName]: 'any non-null value' },
      actualState: { [fieldName]: undefined },
      recoverable: true,
      suggestions: [
        `Provide a value for the ${fieldName} field`,
        `Complete the ${step} step properly before proceeding`,
        'Check the field requirements for this step'
      ]
    });
  }
  
  // Add more factory methods for common errors
}
```

## 3. Instrumenting State Manager

### 3.1 Enhance StateManager Class

```typescript
// src/tools/issueCreationWizard/stateManager.ts

import { WizardState, WizardStep } from './types';
import { logger } from './logging/logger';
import { recordStateChange, validateState } from './logging/debugHelpers';
import { WizardError } from './logging/errorHandling';

export class StateManager {
  private state: WizardState | null = null;
  
  // Get current state with validation
  getState(): WizardState | null {
    logger.debug('Getting wizard state', {
      operation: 'getState',
      stateSnapshot: this.state,
    });
    
    const validation = validateState(this.state || {});
    if (!validation.valid) {
      logger.warn('Retrieved invalid state', {
        operation: 'getState',
        errorContext: { validationErrors: validation.errors }
      });
    }
    
    return this.state;
  }
  
  // Initialize state with logging
  initializeState(): WizardState {
    logger.info('Initializing wizard state', { operation: 'initializeState' });
    
    const startTime = Date.now();
    
    // Create new state
    const newState: WizardState = {
      active: true,
      currentStep: WizardStep.INITIATE,
      fields: {},
      validation: { errors: {}, warnings: {} },
      timestamp: Date.now(),
      sessionId: this.generateSessionId()
    };
    
    // Log the transition
    const duration = Date.now() - startTime;
    logger.logStateTransition('initializeState', this.state || {}, newState, duration);
    
    // Update and record state
    this.state = newState;
    recordStateChange('initializeState', this.state);
    
    return this.state;
  }
  
  // Update state with logging
  updateState(updates: Partial<WizardState>): WizardState {
    logger.info('Updating wizard state', { 
      operation: 'updateState',
      stateSnapshot: { updates }
    });
    
    const startTime = Date.now();
    
    // Validate current state
    if (!this.state || !this.state.active) {
      throw WizardError.noActiveWizard('updateState');
    }
    
    // Validate state transition if step is changing
    if (updates.currentStep && updates.currentStep !== this.state.currentStep) {
      this.validateStepTransition(this.state.currentStep, updates.currentStep);
    }
    
    // Create updated state
    const previousState = { ...this.state };
    const newState = {
      ...this.state,
      ...updates,
      timestamp: Date.now()
    };
    
    // Validate the new state
    const validation = validateState(newState);
    if (!validation.valid) {
      logger.error('Invalid state after update', {
        operation: 'updateState',
        errorContext: { 
          validationErrors: validation.errors,
          updates
        }
      });
      
      throw new WizardError({
        message: `Invalid state after update: ${validation.errors.join(', ')}`,
        operation: 'updateState',
        expectedState: { ...updates, valid: true },
        actualState: newState,
        recoverable: true,
        suggestions: [
          'Provide all required fields for the current step',
          'Follow the proper sequence of wizard steps',
          'Check the validation errors for specific guidance'
        ]
      });
    }
    
    // Log the transition
    const duration = Date.now() - startTime;
    logger.logStateTransition('updateState', previousState, newState, duration);
    
    // Update and record state
    this.state = newState;
    recordStateChange('updateState', this.state);
    
    return this.state;
  }
  
  // Reset state with logging
  resetState(): boolean {
    logger.info('Resetting wizard state', { operation: 'resetState' });
    
    const startTime = Date.now();
    const previousState = this.state ? { ...this.state } : null;
    
    // Reset the state
    this.state = null;
    
    // Log the transition
    const duration = Date.now() - startTime;
    logger.logStateTransition('resetState', previousState || {}, {}, duration);
    
    // Record the change
    recordStateChange('resetState', {});
    
    return true;
  }
  
  // Helper methods
  private validateStepTransition(fromStep: WizardStep, toStep: WizardStep): void {
    logger.debug('Validating step transition', {
      operation: 'validateStepTransition',
      stateSnapshot: {
        fromStep,
        toStep
      }
    });
    
    // Define valid transitions
    const validTransitions: Record<WizardStep, WizardStep[]> = {
      [WizardStep.INITIATE]: [WizardStep.PROJECT_SELECTION],
      [WizardStep.PROJECT_SELECTION]: [WizardStep.ISSUE_TYPE_SELECTION],
      [WizardStep.ISSUE_TYPE_SELECTION]: [WizardStep.FIELD_COMPLETION],
      [WizardStep.FIELD_COMPLETION]: [WizardStep.REVIEW],
      [WizardStep.REVIEW]: [WizardStep.SUBMISSION],
      [WizardStep.SUBMISSION]: []
    };
    
    // Check if transition is valid
    if (!validTransitions[fromStep].includes(toStep)) {
      logger.warn('Invalid step transition', {
        operation: 'validateStepTransition',
        errorContext: {
          fromStep,
          toStep,
          validTransitions: validTransitions[fromStep]
        }
      });
      
      throw WizardError.invalidStateTransition('validateStepTransition', fromStep, toStep);
    }
  }
  
  private generateSessionId(): string {
    return `wizard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const stateManager = new StateManager();
```

## 4. Enhancing MCP Tool Implementations

### 4.1 Update Tool Executors with Logging

This example shows how to enhance one tool executor. The same pattern should be applied to all wizard tool executors.

```typescript
// src/tools/issueCreationWizard/toolExecutors/getStateToolExecutor.ts

import { ToolExecutor, ToolResult } from '@modelcontextprotocol/sdk/types';
import { stateManager } from '../stateManager';
import { logger } from '../logging/logger';
import { formatStateForInspector } from '../logging/debugHelpers';

export function getWizardStateToolExecutor(): ToolExecutor {
  return async function(parameters: Record<string, unknown>): Promise<ToolResult> {
    logger.info('Executing getState tool', {
      operation: 'mcp_IssueCreationWizard_getState',
      stateSnapshot: { parameters }
    });
    
    const startTime = Date.now();
    
    try {
      // Get the current state
      const state = stateManager.getState();
      
      // Log success
      const duration = Date.now() - startTime;
      logger.debug('getState tool completed', {
        operation: 'mcp_IssueCreationWizard_getState',
        duration,
        stateSnapshot: { state }
      });
      
      // Return formatted result
      return {
        content: [
          {
            type: 'text',
            text: state ? JSON.stringify(state) : 'null'
          }
        ],
        metadata: {
          inspectorData: formatStateForInspector(state || {})
        }
      };
    } catch (error) {
      // Log error
      logger.error('getState tool failed', {
        operation: 'mcp_IssueCreationWizard_getState',
        errorContext: {
          message: error.message,
          stack: error.stack
        }
      });
      
      // Return error result
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`
          }
        ],
        isError: true
      };
    }
  };
}
```

### 4.2 Update Tool for MCP Inspector Integration

```typescript
// src/tools/issueCreationWizard/toolExecutors/inspectorIntegration.ts

import { ToolExecutor, ToolResult } from '@modelcontextprotocol/sdk/types';
import { stateManager } from '../stateManager';
import { logger } from '../logging/logger';
import { getStateHistory, formatStateForInspector } from '../logging/debugHelpers';

export function debugWizardStateToolExecutor(): ToolExecutor {
  return async function(parameters: Record<string, unknown>): Promise<ToolResult> {
    logger.info('Executing debugWizardState tool', {
      operation: 'mcp_IssueCreationWizard_debugState',
      stateSnapshot: { parameters }
    });
    
    try {
      // Get current state and history
      const currentState = stateManager.getState();
      const stateHistory = getStateHistory();
      
      // Format for inspector
      const inspectorData = `
        <div class="wizard-debug">
          <h3>Current State</h3>
          ${formatStateForInspector(currentState || {})}
          
          <h3>State History</h3>
          <div class="history">
            ${stateHistory.map((entry, index) => `
              <div class="history-entry">
                <div class="timestamp">${entry.timestamp}</div>
                <div class="operation">${entry.operation}</div>
                <pre>${JSON.stringify(entry.state, null, 2)}</pre>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      // Return result
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              currentState,
              stateHistory: stateHistory.map(h => ({
                timestamp: h.timestamp,
                operation: h.operation
              }))
            })
          }
        ],
        metadata: {
          inspectorData
        }
      };
    } catch (error) {
      // Log error
      logger.error('debugWizardState tool failed', {
        operation: 'mcp_IssueCreationWizard_debugState',
        errorContext: {
          message: error.message,
          stack: error.stack
        }
      });
      
      // Return error result
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`
          }
        ],
        isError: true
      };
    }
  };
}
```

## 5. Implementing Entry/Exit Logging

### 5.1 Create Logging Decorator

```typescript
// src/tools/issueCreationWizard/logging/decorators.ts

import { logger } from './logger';

// Method decorator for logging entry/exit
export function logMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    // Log method entry
    logger.debug(`Entering ${propertyKey}`, {
      operation: propertyKey,
      stateSnapshot: { args: sanitizeArgs(args) }
    });
    
    const startTime = Date.now();
    
    try {
      // Call original method
      const result = originalMethod.apply(this, args);
      
      // For promises, handle async logging
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            // Log successful completion
            const duration = Date.now() - startTime;
            logger.debug(`Exiting ${propertyKey} (success)`, {
              operation: propertyKey,
              duration,
              stateSnapshot: { result: sanitizeResult(value) }
            });
            return value;
          },
          (error) => {
            // Log error
            const duration = Date.now() - startTime;
            logger.error(`Exiting ${propertyKey} (error)`, {
              operation: propertyKey,
              duration,
              errorContext: {
                message: error.message,
                stack: error.stack
              }
            });
            throw error;
          }
        );
      }
      
      // Log successful completion (synchronous)
      const duration = Date.now() - startTime;
      logger.debug(`Exiting ${propertyKey} (success)`, {
        operation: propertyKey,
        duration,
        stateSnapshot: { result: sanitizeResult(result) }
      });
      
      return result;
    } catch (error) {
      // Log error (synchronous)
      const duration = Date.now() - startTime;
      logger.error(`Exiting ${propertyKey} (error)`, {
        operation: propertyKey,
        duration,
        errorContext: {
          message: error.message,
          stack: error.stack
        }
      });
      
      throw error;
    }
  };
  
  return descriptor;
}

// Helper to sanitize arguments for logging
function sanitizeArgs(args: any[]): any[] {
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      // Create a shallow copy to avoid modifying the original
      return { ...arg };
    }
    return arg;
  });
}

// Helper to sanitize results for logging
function sanitizeResult(result: any): any {
  if (typeof result === 'object' && result !== null) {
    // Create a shallow copy to avoid modifying the original
    return { ...result };
  }
  return result;
}
```

### 5.2 Apply Decorator to State Manager Methods

```typescript
// Partial update to stateManager.ts

import { logMethod } from './logging/decorators';

export class StateManager {
  // ...existing code...
  
  @logMethod
  getState(): WizardState | null {
    // Implementation (as before)
  }
  
  @logMethod
  initializeState(): WizardState {
    // Implementation (as before)
  }
  
  @logMethod
  updateState(updates: Partial<WizardState>): WizardState {
    // Implementation (as before)
  }
  
  @logMethod
  resetState(): boolean {
    // Implementation (as before)
  }
  
  // ...more methods...
}
```

## 6. MCP Inspector Integration

### 6.1 Create Inspector Visualization Component

```typescript
// src/tools/issueCreationWizard/inspector/visualization.ts

import { WizardState, WizardStep } from '../types';

export function createStateVisualization(state: Partial<WizardState>): string {
  if (!state) {
    return `<div class="wizard-state-error">No state available</div>`;
  }
  
  const stepStates = {
    [WizardStep.INITIATE]: state.currentStep === WizardStep.INITIATE ? 'active' : 
                          (state.currentStep ? 'completed' : 'pending'),
    [WizardStep.PROJECT_SELECTION]: state.currentStep === WizardStep.PROJECT_SELECTION ? 'active' :
                                  (state.currentStep && getStepOrder(state.currentStep) > getStepOrder(WizardStep.PROJECT_SELECTION) ? 'completed' : 'pending'),
    [WizardStep.ISSUE_TYPE_SELECTION]: state.currentStep === WizardStep.ISSUE_TYPE_SELECTION ? 'active' :
                                     (state.currentStep && getStepOrder(state.currentStep) > getStepOrder(WizardStep.ISSUE_TYPE_SELECTION) ? 'completed' : 'pending'),
    [WizardStep.FIELD_COMPLETION]: state.currentStep === WizardStep.FIELD_COMPLETION ? 'active' :
                                 (state.currentStep && getStepOrder(state.currentStep) > getStepOrder(WizardStep.FIELD_COMPLETION) ? 'completed' : 'pending'),
    [WizardStep.REVIEW]: state.currentStep === WizardStep.REVIEW ? 'active' :
                        (state.currentStep && getStepOrder(state.currentStep) > getStepOrder(WizardStep.REVIEW) ? 'completed' : 'pending'),
    [WizardStep.SUBMISSION]: state.currentStep === WizardStep.SUBMISSION ? 'active' : 'pending'
  };
  
  // Calculate completion percentage
  const stepOrder = getStepOrder(state.currentStep || WizardStep.INITIATE);
  const totalSteps = Object.keys(WizardStep).length;
  const progressPercent = Math.round((stepOrder / totalSteps) * 100);
  
  return `
    <div class="wizard-state-visualization">
      <div class="header">
        <h3>Jira Issue Creation Wizard</h3>
        <div class="status ${state.active ? 'active' : 'inactive'}">
          Status: ${state.active ? 'Active' : 'Inactive'}
        </div>
      </div>
      
      <div class="progress-bar">
        <div class="progress" style="width: ${progressPercent}%"></div>
      </div>
      
      <div class="steps">
        ${Object.values(WizardStep).map(step => `
          <div class="step ${stepStates[step]}">
            <div class="step-name">${formatStepName(step)}</div>
            <div class="step-details">
              ${step === WizardStep.PROJECT_SELECTION && state.projectKey ? 
                `<div class="detail">Project: ${state.projectKey}</div>` : ''}
              ${step === WizardStep.ISSUE_TYPE_SELECTION && state.issueTypeId ? 
                `<div class="detail">Issue Type: ${state.issueTypeId}</div>` : ''}
              ${step === WizardStep.FIELD_COMPLETION && state.fields ? 
                `<div class="detail">Fields: ${Object.keys(state.fields).length} defined</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="metadata">
        <div>Session ID: ${state.sessionId || 'N/A'}</div>
        <div>Last Updated: ${state.timestamp ? new Date(state.timestamp).toISOString() : 'N/A'}</div>
      </div>
    </div>
  `;
}

// Helper function to get step order
function getStepOrder(step: WizardStep): number {
  const stepOrder = {
    [WizardStep.INITIATE]: 1,
    [WizardStep.PROJECT_SELECTION]: 2,
    [WizardStep.ISSUE_TYPE_SELECTION]: 3,
    [WizardStep.FIELD_COMPLETION]: 4,
    [WizardStep.REVIEW]: 5,
    [WizardStep.SUBMISSION]: 6
  };
  
  return stepOrder[step] || 0;
}

// Helper function to format step names
function formatStepName(step: WizardStep): string {
  return step.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
```

### 6.2 Create Interactive Debug Commands

```typescript
// src/tools/issueCreationWizard/inspector/debugCommands.ts

import { WizardState } from '../types';
import { stateManager } from '../stateManager';
import { logger } from '../logging/logger';
import { getStateHistory } from '../logging/debugHelpers';

// Command to dump state history
export function dumpStateHistory(): string {
  const history = getStateHistory();
  
  return `
    <div class="debug-history">
      <h3>State History</h3>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Operation</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          ${history.map(entry => `
            <tr>
              <td>${entry.timestamp}</td>
              <td>${entry.operation}</td>
              <td><pre>${JSON.stringify(entry.state, null, 2)}</pre></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Command to analyze state transitions
export function analyzeStateTransitions(): string {
  const history = getStateHistory();
  
  if (history.length < 2) {
    return `<div class="debug-notice">Not enough state transitions to analyze</div>`;
  }
  
  const transitions = [];
  
  for (let i = 0; i < history.length - 1; i++) {
    const fromState = history[i + 1].state;
    const toState = history[i].state;
    
    const changes = {};
    Object.keys({ ...fromState, ...toState }).forEach(key => {
      if (JSON.stringify(fromState[key]) !== JSON.stringify(toState[key])) {
        changes[key] = {
          from: fromState[key],
          to: toState[key]
        };
      }
    });
    
    transitions.push({
      operation: history[i].operation,
      timestamp: history[i].timestamp,
      changes
    });
  }
  
  return `
    <div class="debug-transitions">
      <h3>State Transitions</h3>
      ${transitions.map(transition => `
        <div class="transition">
          <div class="operation">${transition.operation} (${transition.timestamp})</div>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>From</th>
                <th>To</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(transition.changes).map(([key, value]) => `
                <tr>
                  <td>${key}</td>
                  <td><pre>${JSON.stringify(value.from, null, 2)}</pre></td>
                  <td><pre>${JSON.stringify(value.to, null, 2)}</pre></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>
  `;
}
```

## 7. Implementation Plan

1. **Setup Logging Infrastructure (Day 1-2)**
   - Create the logger utility module
   - Implement basic logging methods
   - Add configuration options for log levels
   - Test basic logging functionality

2. **Enhance Error Handling (Day 2-3)**
   - Create WizardError class with context enrichment
   - Implement factory methods for common errors
   - Add state comparison functionality
   - Test error creation and logging

3. **Add Debug Helpers (Day 3-4)**
   - Implement state history tracking
   - Create state validation functions
   - Add state visualization helpers
   - Test history and validation functionality

4. **Instrument State Manager (Day 4-5)**
   - Add comprehensive logging to all state operations
   - Implement entry/exit logging using decorators
   - Add state transition validation with detailed logging
   - Test state operations with logging

5. **Enhance MCP Tools (Day 6-7)**
   - Update all tool executors with logging
   - Add error handling with context
   - Implement performance measurement
   - Test tool operations with logging

6. **Add MCP Inspector Integration (Day 7-10)**
   - Create visualization components for wizard state
   - Implement interactive debug commands
   - Add state history visualization
   - Test inspector integration

## 8. Success Criteria

The implementation will be considered successful when:

1. All state operations and transitions are comprehensively logged
2. Error messages include detailed context (expected vs. actual state)
3. The "No active wizard found" error includes detailed context about what went wrong
4. Logs contain entry/exit information for all state-modifying functions
5. The MCP Inspector shows visual representations of the wizard state
6. Developers can trace state changes through the logs
7. Performance metrics are captured for all operations

## 9. Testing Plan

1. **Unit Tests**
   - Test logger functionality with different log levels
   - Test error context enrichment
   - Test state validation functions
   - Test decorator functionality

2. **Integration Tests**
   - Test state transitions with logging
   - Test error handling in various scenarios
   - Test tool operations with logging
   - Test state persistence and recovery

3. **Manual Verification**
   - Verify logs are comprehensive and readable
   - Check MCP Inspector integration
   - Test error scenarios to verify context-rich messages
   - Verify the "No active wizard found" error is well-documented

By implementing these enhancements, we will create a robust logging and debugging framework for the Jira Issue Creation Wizard that will make it much easier to diagnose and fix issues like the "No active wizard found" error. 