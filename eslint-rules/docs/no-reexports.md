# No Re-exports Rule

This rule prevents "pass-through" re-exporting of imported identifiers, enforcing that modules should add value rather than just re-exporting imports.

## Rule Details

This rule aims to prevent code patterns where modules simply re-export imported identifiers without adding value, making the code harder to follow and maintain.

## Enhanced Error Messages

This rule provides detailed error messages that:

1. Clearly explain why passthrough exports are problematic
2. Guide developers on how to fix the issue
3. Suggest better alternatives

For example, instead of a generic message like "Re-exporting X is not allowed", you'll see:

```
Passthrough export of 'X' from './module' is not allowed. Modules should add value, 
not just re-export. Remove this re-export and update affected imports to use './module' directly.
```

These detailed messages help developers understand the reasoning behind the rule and provide clear guidance on how to fix the issue.

## Examples of incorrect code for this rule:

```js
// Direct re-export
import { foo } from './module';
export { foo };

// Re-export with renaming
import { foo } from './module';
export { foo as bar };

// Re-export via variable
import { foo } from './module';
const reExport = foo;
export { reExport };

// Direct re-export syntax
export { foo } from './module';

// Export all
export * from './module';

// Default export re-export
import foo from './module';
export default foo;

// Variable declaration export
import { foo } from './module';
export const exportedFoo = foo;
```

## Examples of correct code for this rule:

```js
// Original exports, not re-exports
export const foo = 'bar';
export function doSomething() { return true; }

// Modifying or enhancing the imported item before exporting
import { foo } from './module';
export const enhancedFoo = { ...foo, extraProp: true };

// Exporting a combination of imports and original values
import { foo } from './module';
export const combined = {
  foo,
  extraStuff: 'value'
};
```

## Options

The rule accepts an options object with the following properties:

* `allowList`: An array of identifiers that are allowed to be re-exported.
* `allowModules`: An array of module paths from which imports are allowed to be re-exported.
* `allowRenamed`: A boolean indicating whether re-exports are allowed if they are renamed.

Example configuration:

```js
{
  rules: {
    'no-reexports': ['error', {
      allowList: ['specificItem'],
      allowModules: ['./allowed-module'],
      allowRenamed: true
    }]
  }
}
```

## Usage

Configure the rule in your ESLint configuration file:

```js
// In eslint.config.js
module.exports = [
  {
    // ...other config
    rules: {
      'custom-rules/no-reexports': 'error'
    }
  }
];
``` 