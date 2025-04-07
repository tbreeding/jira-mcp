/**
 * Tests for the no-reexports ESLint rule
 */
const { RuleTester } = require('eslint');
const noReexportsRule = require('../no-reexports');

// Use ESLint v9+ flat config format
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  }
});

ruleTester.run('no-reexports', noReexportsRule, {
  valid: [
    // Original exports, not re-exports
    "export const foo = 'bar';",
    "export function doSomething() { return true; }",
    
    // Not re-exporting imported items
    "import { thing } from './module'; export const otherThing = 'value';",
    
    // Allowed via options.allowList
    {
      code: "import { thing } from './module'; export { thing };",
      options: [{ allowList: ['thing'] }]
    },
    
    // Allowed via options.allowModules
    {
      code: "import { thing } from './allowed-module'; export { thing };",
      options: [{ allowModules: ['./allowed-module'] }]
    },
    
    // Allowed renamed exports when allowRenamed is true
    {
      code: "import { thing } from './module'; export { thing as renamedThing };",
      options: [{ allowRenamed: true }]
    }
  ],
  invalid: [
    // Basic re-export case
    {
      code: "import { thing } from './module'; export { thing };",
      errors: [{ message: "Passthrough export of 'thing' from './module' is not allowed. Modules should add value, not just re-export. Remove this re-export and update affected imports to use './module' directly." }]
    },
    
    // Re-export with renaming
    {
      code: "import { thing } from './module'; export { thing as otherThing };",
      errors: [{ message: "Passthrough export of 'thing' from './module' is not allowed. Modules should add value, not just re-export. Remove this re-export and update affected imports to use './module' directly." }]
    },
    
    // Re-export via variable
    {
      code: "import { thing } from './module'; const reExport = thing; export { reExport };",
      errors: [{ message: "Passthrough export of 'reExport' which wraps an import from './module' is not allowed. Remove this variable and re-export pattern and update imports to reference './module' directly." }]
    },
    
    // Direct re-export syntax
    {
      code: "export { thing } from './module';",
      errors: [{ message: "Passthrough export from './module' is not allowed. Passthrough files add complexity without value. Remove this re-export and import directly from './module' where needed." }]
    },
    
    // Export all
    {
      code: "export * from './module';",
      errors: [{ message: "Exporting all from './module' is not allowed. This creates hard-to-track dependencies. Import and export specific items with added value, or update affected imports to use './module' directly." }]
    },
    
    // Default export re-export
    {
      code: "import thing from './module'; export default thing;",
      errors: [{ message: "Passthrough default export of 'thing' from './module' is not allowed. Default exports should provide value, not just re-export. Remove this file or add functionality before exporting." }]
    },
    
    // Variable declaration export
    {
      code: "import { thing } from './module'; export const exportedThing = thing;",
      errors: [{ message: "Passthrough export of 'thing' from './module' via variable declaration is not allowed. Add meaningful transformation or remove this pattern entirely. Update affected imports to use './module' directly." }]
    }
  ]
}); 