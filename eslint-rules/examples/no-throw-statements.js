/**
 * Examples of code that violates the no-throw-statements rule
 * and examples of the correct approach using the Try pattern
 */

// BAD: Using throw statements (will trigger ESLint errors)
function badFunction1(value) {
  if (!value) {
    throw new Error('Value is required');
  }
  return value * 2;
}

function badFunction2(obj) {
  if (typeof obj !== 'object') {
    throw new Error('Expected an object');
  }
  if (!obj.id) {
    throw new Error('Object must have an id');
  }
  return obj.id;
}

function badFunction3() {
  try {
    // Some operation that might fail
    return JSON.parse('{"invalid": json}');
  } catch (error) {
    // Simply rethrowing (will trigger ESLint error)
    throw error;
  }
}

// GOOD: Using the Try pattern
import { Success, Failure } from '../../src/utils/try';

function goodFunction1(value) {
  if (!value) {
    return Failure(new Error('Value is required'));
  }
  return Success(value * 2);
}

function goodFunction2(obj) {
  if (typeof obj !== 'object') {
    return Failure(new Error('Expected an object'));
  }
  if (!obj.id) {
    return Failure(new Error('Object must have an id'));
  }
  return Success(obj.id);
}

function goodFunction3() {
  try {
    // Some operation that might fail
    const result = JSON.parse('{"valid": "json"}');
    return Success(result);
  } catch (error) {
    // Return failure instead of rethrowing
    return Failure(error);
  }
}

// How to handle the result (the caller's perspective)
function useTheResult() {
  const result = goodFunction1(5);
  
  if (result.success) {
    console.log('The operation succeeded:', result.value);
  } else {
    console.error('The operation failed:', result.error.message);
    // No exception thrown, the program continues to run
  }
  
  // Chaining multiple operations
  const finalResult = goodFunction1(10)
    .then(val => goodFunction2({ id: val }))
    .catchError(err => console.error('Error in chain:', err.message));
}

// Helper methods for the Try pattern (for demonstration only)
// The actual implementation is in src/utils/try.ts
function then(result, fn) {
  if (result.success) {
    return fn(result.value);
  }
  return result; // Pass the failure through
}

function catchError(result, fn) {
  if (!result.success) {
    fn(result.error);
  }
  return result;
} 