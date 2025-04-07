/**
 * Script to run ESLint rule tests
 */
require('./__tests__/no-reexports.test');
require('./__tests__/enhanced-complexity.test');
require('./__tests__/require-file-header.test');
require('./__tests__/no-throw-statements.test');
console.log('All tests passed!'); 