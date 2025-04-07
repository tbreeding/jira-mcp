/**
 * Tests for the file-length ESLint rule
 */
const { RuleTester } = require('eslint');
const fileLengthRule = require('../file-length');

// Set up the rule tester
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

// Helper function to create a code string with a specified number of lines
function createCodeWithLines(lineCount) {
  return 'const x = 1;\n'.repeat(lineCount - 1) + 'const y = 2;';
}

// Run the tests
ruleTester.run('file-length', fileLengthRule, {
  valid: [
    // Should be valid when it's exactly at the line limit
    {
      code: createCodeWithLines(200),
      filename: 'test.ts',
      options: [{ maxLines: 200 }]
    },
    // Should be valid when it's under the line limit
    {
      code: createCodeWithLines(150),
      filename: 'test.ts',
      options: [{ maxLines: 200 }]
    },
    // Should be valid when it's a non-TypeScript file (even if it's over the limit)
    {
      code: createCodeWithLines(250),
      filename: 'test.js',
      options: [{ maxLines: 200 }]
    },
    // Should be valid when it matches an ignore pattern
    {
      code: createCodeWithLines(250),
      filename: 'test.test.ts',
      options: [{ maxLines: 200 }]
    },
    // Should be valid with custom ignore pattern
    {
      code: createCodeWithLines(250),
      filename: 'special.ts',
      options: [{ maxLines: 200, ignorePatterns: ['special.ts'] }]
    }
  ],
  invalid: [
    // Should be invalid when it's over the line limit
    {
      code: createCodeWithLines(210),
      filename: 'test.ts',
      options: [{ maxLines: 200 }],
      errors: [
        {
          messageId: 'tooLong'
        }
      ]
    },
    // Should be invalid with a custom line limit
    {
      code: createCodeWithLines(110),
      filename: 'test.ts',
      options: [{ maxLines: 100 }],
      errors: [
        {
          messageId: 'tooLong'
        }
      ]
    }
  ]
});

// Log a success message
console.log('All file-length rule tests passed!'); 