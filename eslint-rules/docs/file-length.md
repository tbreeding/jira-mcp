# file-length

This rule enforces a maximum file length for TypeScript files to maintain code quality, readability, and maintainability.

## Rule Details

Large files are often difficult to understand, test, and maintain. This rule helps enforce a best practice of keeping files focused on a single responsibility with a reasonable size.

The rule:
- Only applies to TypeScript (`.ts`) files
- Ignores test files (`.test.ts`, `.spec.ts`) by default
- Has a default maximum of 200 lines per file

### Examples

#### ❌ Incorrect

```ts
// A file with more than 200 lines of TypeScript code
// ... (201+ lines of code)
```

#### ✅ Correct

```ts
// A file with 200 or fewer lines of TypeScript code
// ... (200 or fewer lines of code)
```

## Options

This rule has an object option:

```js
{
  "file-length": ["error", {
    // Maximum number of lines allowed per file (default: 200)
    "maxLines": 200,
    
    // Array of file patterns to ignore (default: ["*.test.ts", "*.spec.ts", "*.stories.ts"])
    "ignorePatterns": ["*.test.ts", "*.spec.ts", "*.stories.ts"]
  }]
}
```

### maxLines

The maximum number of lines allowed per file. Default is 200.

### ignorePatterns

An array of patterns for files to ignore. The rule supports simple glob patterns like `*.test.ts` to match file extensions. Default patterns ignore test and story files.

## When Not To Use It

You might want to disable this rule if:

1. Your codebase has specific files that need to be large by design
2. You have alternative code organization practices in place
3. You're in the early prototyping phase where file structure is still evolving

## Further Reading

- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [Clean Code: A Handbook of Agile Software Craftsmanship](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [The Art of Readable Code](https://www.oreilly.com/library/view/the-art-of/9781449318482/) 