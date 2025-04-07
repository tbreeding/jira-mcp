/**
 * Tests for the enhanced-complexity ESLint rule
 */
const { RuleTester } = require('eslint');
const enhancedComplexityRule = require('../enhanced-complexity');

// Use ESLint v9+ flat config format
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  }
});

// Create a regex pattern to match the enhanced message format - exact match
const messagePattern = `Function has a complexity of 3, which exceeds the maximum allowed complexity of 2. High complexity makes code harder to understand, test, and maintain. Consider refactoring by:
1. Extracting helper functions for logical sub-operations
2. Simplifying nested conditionals with early returns
3. Using functional programming patterns to process data
4. Breaking the function into smaller, focused functions with clear purposes`;

ruleTester.run('enhanced-complexity', enhancedComplexityRule, {
  valid: [
    // Simple function - only 1 decision point
    {
      code: `function simple() { return true; }`,
      options: [2]
    },
    
    // Function with single if - has complexity of 2
    {
      code: `
function oneIf(a) {
  if (a) {
    return true;
  }
  return false;
}`,
      options: [2]
    },
    
    // Arrow function with block body and single condition
    {
      code: `const simpleArrow = (a) => { if (a) { return 1; } return 2; };`,
      options: [2]
    }
  ],
  
  invalid: [
    // Function with 2 ifs - complexity of 3
    {
      code: `
function twoIfs(a, b) {
  if (a) {
    return 1;
  }
  if (b) {
    return 2;
  }
  return 3;
}`,
      options: [2],
      errors: [{
        message: messagePattern
      }]
    },
    
    // Single if with logical AND - complexity of 3
    {
      code: `
function ifWithAnd(a, b) {
  if (a && b) {
    return true;
  }
  return false;
}`,
      options: [2],
      errors: [{
        message: messagePattern
      }]
    },
    
    // Function with ternary - complexity of 3
    {
      code: `
function ternary(a, b) {
  return a ? b ? true : false : false;
}`,
      options: [2],
      errors: [{
        message: messagePattern
      }]
    },
    
    // Function with switch - complexity depends on number of cases
    {
      code: `
function switchFunction(value) {
  switch(value) {
    case 1: return 'one';
    case 2: return 'two';
    default: return 'other';
  }
}`,
      options: [2],
      errors: [{
        message: messagePattern
      }]
    },
    
    // Function with loop - complexity of 2 + nested logic
    {
      code: `
function loop(items) {
  for (let i = 0; i < items.length; i++) {
    if (items[i] > 10) {
      return true;
    }
  }
  return false;
}`,
      options: [2],
      errors: [{
        message: messagePattern
      }]
    }
  ]
}); 