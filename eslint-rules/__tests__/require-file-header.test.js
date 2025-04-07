/**
 * Simplified unit tests for the require-file-header ESLint rule
 */
const { RuleTester } = require('eslint');
const requireFileHeader = require('../require-file-header-test');

// Configure rule tester
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020
  }
});

// Run tests
ruleTester.run('require-file-header', requireFileHeader, {
  valid: [
    // Valid file with proper header comment (default options)
    {
      code: `/**
 * This is a valid header comment that meets the minimum length requirement.
 * It provides helpful context about the purpose of this file.
 */
function example() { return true; }`,
      options: [{ minLength: 50 }]
    }
  ],
  invalid: [
    // Missing header comment
    {
      code: `function example() { return true; }`,
      options: [{ minLength: 50 }],
      errors: [{ messageId: 'missingHeader' }]
    },
    // Header comment too short
    {
      code: `/**
 * Too short comment.
 */
function example() { return true; }`,
      options: [{ minLength: 50 }],
      errors: [{ messageId: 'headerTooShort' }]
    },
    // Header comment too long
    {
      code: `/**
 * This is a very long comment that exceeds the maximum length.
 * It goes on and on with unnecessary details that don't add value.
 * This makes the comment harder to read and less focused on what matters.
 * Shorter, more concise comments are often more effective.
 */
function example() { return true; }`,
      options: [{ maxLength: 100 }],
      errors: [{ messageId: 'headerTooLong' }]
    }
  ]
}); 