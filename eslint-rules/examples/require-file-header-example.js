/**
 * This is an example of a valid file header comment that meets the length requirements.
 * It provides clear context about the purpose of this file, which is to demonstrate
 * the require-file-header ESLint rule. The comment should be between 50 and 500 characters 
 * to pass the rule's validation.
 */

// This example shows a valid file with a proper header comment
function ExampleClass() {
  this.doSomething = function() {
    console.log('Doing something...');
  };
}

module.exports = ExampleClass;

// For reference, files missing a header comment or with too short comments 
// (under 50 characters) would trigger an ESLint error when using this rule 