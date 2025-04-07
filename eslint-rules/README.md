# Custom ESLint Rules

This directory contains custom ESLint rules for this project.

## No Re-exports Rule

This rule prevents "pass-through" re-exporting of imported identifiers, enforcing that modules should add value rather than just re-exporting imports.

[Detailed documentation for no-reexports rule](./docs/no-reexports.md)

## Enhanced Complexity Rule

This rule extends ESLint's built-in `complexity` rule with more descriptive and actionable error messages. The rule uses the same detection logic but provides developers with clearer guidance on how to address complexity issues.

[Detailed documentation for enhanced-complexity rule](./docs/enhanced-complexity.md)

## Require File Header Rule

This rule enforces that files include a descriptive header comment that explains the file's purpose. The goal is to provide clear context for both developers and AI agents working with the codebase.

[Detailed documentation for require-file-header rule](./docs/require-file-header.md)

## No Throw Statements Rule

This rule enforces the use of the Try/Result pattern for error handling instead of throwing exceptions. It helps maintain consistent error handling throughout the codebase by ensuring functions return error objects rather than throw exceptions.

[Detailed documentation for no-throw-statements rule](./docs/no-throw-statements.md)

## Integration

To use these custom rules in your ESLint configuration, update the `eslint.config.js` file to include the rules:

```js
// In eslint.config.js
const customRules = require('./eslint-rules');

module.exports = [
  // existing config...
  {
    files: ['**/*.ts'],
    // other config...
    plugins: {
      // existing plugins...
      'custom-rules': customRules
    },
    rules: {
      // existing rules...
      'custom-rules/no-reexports': 'error',
      
      // Turn off the built-in complexity rule
      'complexity': 'off',
      // Use our enhanced version instead
      'custom-rules/enhanced-complexity': ['error', 6],
      
      // Require file header comments
      'custom-rules/require-file-header': ['error', {
        include: ['./src/**/*.ts'],
        exclude: [
          './src/**/__tests__/**',
          './src/**/*.test.ts', 
          './src/**/*.spec.ts'
        ],
        minLength: 50,
        maxLength: 500
      }],
      
      // Enforce Try pattern instead of throw statements
      'custom-rules/no-throw-statements': ['error', {
        allowList: [
          '**/__tests__/**',
          '**/*.test.ts',
          '**/*.spec.ts'
        ],
        allowInCatchBlocks: false
      }]
    }
  }
];