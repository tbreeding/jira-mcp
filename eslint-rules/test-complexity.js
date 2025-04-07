/**
 * Manual test for the enhanced complexity rule
 */
const { Linter } = require('eslint');
const enhancedComplexityRule = require('./enhanced-complexity');

// Create a new linter
const linter = new Linter();

// Example code to test
const testCases = [
  {
    name: "Simple function",
    code: "function simple() { return true; }",
    options: [2],
    expectedErrors: 0
  },
  {
    name: "Function with one if",
    code: "function oneIf(a) { if (a) { return 1; } return 2; }",
    options: [2],
    expectedErrors: 0
  },
  {
    name: "Function with two ifs",
    code: "function twoIfs(a, b) { if (a) { return 1; } if (b) { return 2; } return 3; }",
    options: [2],
    expectedErrors: 1
  },
  {
    name: "Function with logical AND",
    code: "function ifWithAnd(a, b) { if (a && b) { return true; } return false; }",
    options: [2],
    expectedErrors: 1
  },
  {
    name: "Function with ternary",
    code: "function ternary(a, b) { return a ? b ? true : false : false; }",
    options: [2],
    expectedErrors: 1
  }
];

// Configure ESLint with flat config format
const createConfig = (threshold) => [
  {
    plugins: {
      "custom-rules": { 
        rules: {
          "enhanced-complexity": enhancedComplexityRule
        }
      }
    },
    rules: {
      "custom-rules/enhanced-complexity": [2, threshold]
    },
    languageOptions: {
      ecmaVersion: 2020
    }
  }
];

// Run tests
let passedTests = 0;
let failedTests = 0;

for (const testCase of testCases) {
  const config = createConfig(testCase.options[0]);
  const messages = linter.verify(testCase.code, config);
  const complexityErrors = messages.filter(m => m.ruleId === "custom-rules/enhanced-complexity");
  
  console.log(`\nTest: ${testCase.name}`);
  console.log(`Code: ${testCase.code}`);
  console.log(`Expected errors: ${testCase.expectedErrors}`);
  console.log(`Actual errors: ${complexityErrors.length}`);
  
  if (complexityErrors.length > 0) {
    console.log(`Error message: ${complexityErrors[0].message}`);
  }
  
  if (complexityErrors.length === testCase.expectedErrors) {
    console.log("✅ Test passed");
    passedTests++;
  } else {
    console.log("❌ Test failed");
    failedTests++;
  }
}

console.log(`\nResults: ${passedTests} passed, ${failedTests} failed`);

if (failedTests === 0) {
  console.log("All tests passed!");
} else {
  console.error("Some tests failed!");
  process.exit(1);
} 