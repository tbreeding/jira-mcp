/**
 * ESLint rule to enforce maximum file length for TypeScript files
 * 
 * This rule helps maintain code quality by ensuring files don't grow too large,
 * which improves readability, testability, and maintainability.
 */
module.exports = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Enforce maximum file length for TypeScript files',
			category: 'Best Practices',
			recommended: false,
		},
		schema: [
			{
				type: 'object',
				properties: {
					maxLines: {
						type: 'integer',
						minimum: 1,
						description: 'Maximum number of lines allowed in a file'
					},
					ignorePatterns: {
						type: 'array',
						items: { type: 'string' },
						description: 'List of file patterns to ignore'
					}
				},
				additionalProperties: false,
			},
		],
		messages: {
			tooLong: 'File has {{lineCount}} lines, which exceeds the maximum allowed length of {{maxLines}} lines. Large files are difficult to understand, test, and maintain. Consider refactoring by:\n\n1. Extracting cohesive groups of functions/components into separate files\n2. Splitting the file based on domain concerns or functionality\n3. Creating reusable utilities for repeated code patterns\n4. Applying the Single Responsibility Principle - a file should have only one reason to change\n5. Using composition over inheritance to build complex functionality from simpler parts\n6. Remember to test any extracted functions separately\n\nRemember that smaller, focused files are easier to comprehend, test, and maintain. Each file should represent a single logical unit of your application.'
		}
	},
	create: function (context) {
		// Default max lines is 200 if not specified
		const options = context.options[0] || {};
		const maxLines = options.maxLines || 200;
		const ignorePatterns = options.ignorePatterns || ['*.test.ts', '*.spec.ts', '*.stories.ts'];
		
		// Only process on 'Program' node (once per file)
		return {
			Program(node) {
				const filename = context.getFilename();
				
				// Check if the file is a TypeScript file (ends with .ts)
				if (!filename.endsWith('.ts')) {
					return;
				}
				
				// Check if this file should be ignored based on patterns
				const shouldIgnore = ignorePatterns.some(pattern => {
					// Simple glob pattern matching for *.extension
					if (pattern.startsWith('*') && pattern.includes('.')) {
						const extension = pattern.slice(1); // Remove the *
						return filename.endsWith(extension);
					}
					return filename.includes(pattern);
				});
				
				if (shouldIgnore) {
					return;
				}
				
				// Get the source code and count lines
				const sourceCode = context.getSourceCode();
				const lines = sourceCode.lines || sourceCode.getText().split('\n');
				const lineCount = lines.length;
				
				// Report if the file exceeds the maximum length
				if (lineCount > maxLines) {
					context.report({
						node,
						messageId: 'tooLong',
						data: {
							lineCount,
							maxLines
						}
					});
				}
			}
		};
	}
} 