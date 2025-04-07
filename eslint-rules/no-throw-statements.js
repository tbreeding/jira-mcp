/**
 * ESLint rule to prevent using throw statements
 * 
 * This rule enforces the use of the Try/Result pattern for error handling
 * instead of throwing exceptions, as per the project's error handling guidelines.
 */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow throw statements in favor of Try/Result pattern',
			category: 'Best Practices',
			recommended: false,
		},
		schema: [
			{
				type: 'object',
				properties: {
					allowList: {
						type: 'array',
						items: { type: 'string' },
						description: 'List of file patterns where throws are allowed'
					},
					allowInCatchBlocks: {
						type: 'boolean',
						description: 'Whether to allow throw statements inside catch blocks for rethrowing'
					}
				},
				additionalProperties: false,
			},
		],
		messages: {
			noThrow: 'Throw statements are not allowed. Use the Try/Result pattern instead (import from src/utils/try.ts).',
			suggestTryPattern: 'Use Failure() from the Try pattern instead of throwing an error'
		},
		hasSuggestions: true,
		fixable: null
	},
	create: function (context) {
		const options = context.options[0] || {};
		const allowList = new Set(options.allowList || []);
		const allowInCatchBlocks = options.allowInCatchBlocks || false;
		
		// Check if the current file is in the allowList
		const filename = context.getFilename();
		const isAllowed = Array.from(allowList).some(pattern => {
			if (pattern instanceof RegExp) {
				return pattern.test(filename);
			}
			return filename.includes(pattern);
		});
		
		if (isAllowed) {
			return {}; // Skip checking this file
		}
		
		return {
			ThrowStatement(node) {
				// If allowInCatchBlocks is true, check if we're inside a catch block
				let isInCatchBlock = false;
				if (allowInCatchBlocks) {
					let parent = node.parent;
					while (parent) {
						if (parent.type === 'CatchClause') {
							isInCatchBlock = true;
							return; // Skip this throw, it's in a catch block
						}
						parent = parent.parent;
					}
				} else {
					// Check if we're in a catch block (needed for different suggestion format)
					let parent = node.parent;
					while (parent) {
						if (parent.type === 'CatchClause') {
							isInCatchBlock = true;
							break;
						}
						parent = parent.parent;
					}
				}
				
				context.report({
					node,
					messageId: 'noThrow',
					suggest: [
						{
							messageId: 'suggestTryPattern',
							fix(fixer) {
								// For catch blocks, we need special handling since we can't return directly
								if (isInCatchBlock) {
									const errorExpr = context.getSourceCode().getText(node.argument);
									return fixer.replaceText(
										node,
										`const error = Failure(${errorExpr}); /* Handle this error appropriately */`
									);
								}
								
								// Basic suggestion to replace throw with Failure
								// This is a simplistic fix and may need manual adjustment
								if (node.argument.type === 'NewExpression' && 
									node.argument.callee.name === 'Error') {
									
									// Get the error message and any other args
									const args = node.argument.arguments;
									if (args.length > 0) {
										const errorMsg = context.getSourceCode().getText(args[0]);
										return fixer.replaceText(
											node,
											`return Failure(new Error(${errorMsg}));`
										);
									}
								}
								
								// Generic fallback suggestion
								const errorExpr = context.getSourceCode().getText(node.argument);
								return fixer.replaceText(
									node,
									`return Failure(${errorExpr});`
								);
							}
						}
					]
				});
			}
		};
	}
} 