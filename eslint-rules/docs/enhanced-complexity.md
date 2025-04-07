# Enhanced Complexity Rule

This rule extends ESLint's built-in `complexity` rule with more descriptive and actionable error messages.

## Rule Details

The enhanced complexity rule uses the same logic as ESLint's built-in rule but provides more helpful error messages that:

1. Clearly indicate the current complexity and the maximum allowed complexity
2. Explain why high complexity is problematic
3. Provide specific strategies for reducing complexity

## Message Comparison

### Original Complexity Rule Message
```
Function has a complexity of 10, which is too high. Maximum allowed is 6.
```

### Enhanced Complexity Rule Message
```
Function has a complexity of 10, which exceeds the maximum allowed complexity of 6. High complexity makes code harder to understand, test, and maintain. Consider refactoring by:
1. Extracting helper functions for logical sub-operations
2. Simplifying nested conditionals with early returns
3. Using functional programming patterns to process data
4. Breaking the function into smaller, focused functions with clear purposes
```

## Usage

Configure the rule in your ESLint configuration file:

```js
// In eslint.config.js
module.exports = [
  {
    // ...other config
    rules: {
      // Turn off the built-in complexity rule
      'complexity': 'off',
      // Enable the enhanced version
      'custom-rules/enhanced-complexity': ['error', 6]
    }
  }
];
```

## Options

This rule has the same options as the original `complexity` rule:

* A number indicating the maximum cyclomatic complexity allowed (default is 20)
* An object with either a `maximum` or `max` property specifying the maximum complexity

Example:
```js
// Using a number
'custom-rules/enhanced-complexity': ['error', 6]

// Using an object
'custom-rules/enhanced-complexity': ['error', { maximum: 6 }]
```

## How It Works

This rule wraps the built-in ESLint complexity rule and intercepts its error messages, replacing them with more detailed and helpful versions that guide developers toward effective refactoring strategies. 