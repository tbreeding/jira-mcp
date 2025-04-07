/**
 * Tests for the no-throw-statements ESLint rule
 */
const { RuleTester } = require('eslint');
const noThrowStatementsRule = require('../no-throw-statements');

// Use ESLint v9+ flat config format
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  }
});

ruleTester.run('no-throw-statements', noThrowStatementsRule, {
  valid: [
    // Using Try pattern instead of throw
    "import { Failure } from '../utils/try'; function example() { return Failure(new Error('error')); }",
    
    // Regular function with no throws
    "function example() { return true; }",
    
    // Try/catch with no throws
    "try { console.log('test'); } catch (e) { console.error(e); }",
    
    // Using Try pattern in a conditional
    "import { Failure } from '../utils/try'; function example(condition) { if (condition) { return Failure(new Error('error')); } }",
    
    // Allowed via options.allowInCatchBlocks
    {
      code: "try { console.log('test'); } catch (e) { throw e; }",
      options: [{ allowInCatchBlocks: true }]
    },
    
    // Allowed via options.allowList
    {
      code: "function example() { throw new Error('Not allowed'); }",
      options: [{ allowList: ['no-throw-statements.test.js'] }],
      filename: 'no-throw-statements.test.js'
    }
  ],
  invalid: [
    // Basic throw case
    {
      code: "function example() { throw new Error('Not allowed'); }",
      errors: [{ 
        messageId: 'noThrow',
        suggestions: [
          {
            messageId: 'suggestTryPattern',
            output: "function example() { return Failure(new Error('Not allowed')); }"
          }
        ]
      }]
    },
    
    // Throw in a conditional
    {
      code: "function example(condition) { if (condition) { throw new Error('Not allowed'); } }",
      errors: [{ 
        messageId: 'noThrow',
        suggestions: [
          {
            messageId: 'suggestTryPattern',
            output: "function example(condition) { if (condition) { return Failure(new Error('Not allowed')); } }"
          }
        ]
      }]
    },
    
    // Throw in try/catch when not allowed in catch blocks
    {
      code: "try { console.log('test'); } catch (e) { throw e; }",
      errors: [{ 
        messageId: 'noThrow',
        suggestions: [
          {
            messageId: 'suggestTryPattern',
            output: "try { console.log('test'); } catch (e) { const error = Failure(e); /* Handle this error appropriately */ }"
          }
        ]
      }]
    },
    
    // Throw with a complex expression
    {
      code: "function example() { throw new CustomError('Not allowed', 500); }",
      errors: [{ 
        messageId: 'noThrow',
        suggestions: [
          {
            messageId: 'suggestTryPattern',
            output: "function example() { return Failure(new CustomError('Not allowed', 500)); }"
          }
        ]
      }]
    },
    
    // Throw with a variable
    {
      code: "function example() { const err = new Error('Not allowed'); throw err; }",
      errors: [{ 
        messageId: 'noThrow',
        suggestions: [
          {
            messageId: 'suggestTryPattern',
            output: "function example() { const err = new Error('Not allowed'); return Failure(err); }"
          }
        ]
      }]
    }
  ]
}); 