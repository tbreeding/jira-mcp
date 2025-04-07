# no-throw-statements

This rule enforces the use of the Try/Result pattern for error handling instead of throwing exceptions.

## Rule Details

This rule is aimed at preventing the use of `throw` statements in favor of the project's `Try` pattern (Result/Either pattern). Instead of throwing exceptions, functions should return a `Failure` object from the `Try` pattern.

### Examples

#### ❌ Incorrect

```js
function getData(id) {
  if (!id) {
    throw new Error("ID is required");
  }
  // implementation
}
```

```js
function processValue(value) {
  try {
    // processing
  } catch (error) {
    throw error;
  }
}
```

#### ✅ Correct

```js
import { Success, Failure } from '../utils/try';

function getData(id) {
  if (!id) {
    return Failure(new Error("ID is required"));
  }
  // implementation
  return Success(data);
}
```

```js
import { Success, Failure } from '../utils/try';

function processValue(value) {
  try {
    // processing
    return Success(result);
  } catch (error) {
    return Failure(error);
  }
}
```

## Options

This rule has an options object with the following properties:

### `allowList`

An array of file patterns where throw statements are allowed. This is useful for excluding specific files or directories from the rule.

```json
{
  "rules": {
    "no-throw-statements": ["error", {
      "allowList": ["test/", "e2e/", "*.test.js"]
    }]
  }
}
```

### `allowInCatchBlocks`

A boolean indicating whether throw statements should be allowed inside catch blocks for rethrowing errors. Default is `false`.

```json
{
  "rules": {
    "no-throw-statements": ["error", {
      "allowInCatchBlocks": true
    }]
  }
}
```

## Autofixing

This rule offers suggestions for automatically fixing throw statements by replacing them with the equivalent `Failure` pattern. However, these suggestions should be carefully reviewed before applying them, as they might not fully capture the intent of the original code.

## When Not To Use It

If your project doesn't follow the Result/Try pattern for error handling and instead relies on exceptions, you shouldn't use this rule. 