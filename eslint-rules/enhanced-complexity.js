/**
 * ESLint rule that provides enhanced error messages for function complexity issues
 */
module.exports = {
	meta: {
		type: 'suggestion',
		docs: {
			description: "Enhanced version of ESLint's complexity rule with more descriptive messages",
			category: 'Best Practices',
			recommended: false,
		},
		schema: [
			{
				oneOf: [
					{
						type: 'integer',
						minimum: 0,
					},
					{
						type: 'object',
						properties: {
							maximum: {
								type: 'integer',
								minimum: 0,
							},
							max: {
								type: 'integer',
								minimum: 0,
							},
						},
						additionalProperties: false,
					},
				],
			},
		],
	},
	create: function (context) {
		// Get the complexity threshold from options
		const maxComplexity = context.options[0] || 20
		const threshold =
			typeof maxComplexity === 'object' ? maxComplexity.maximum || maxComplexity.max || 20 : maxComplexity

		// For debugging purposes
		const debug = false

		// The function to create enhanced error messages
		function createEnhancedMessage(_node, threshold, currentComplexity) {
			return `Function has a complexity of ${currentComplexity}, which exceeds the maximum allowed complexity of ${threshold}. High complexity makes code harder to understand, test, and maintain. Consider refactoring by:
1. Extracting helper functions for logical sub-operations
2. Simplifying nested conditionals with early returns
3. Using functional programming patterns to process data
4. Breaking the function into smaller, focused functions with clear purposes`
		}

		// Calculate cyclomatic complexity for a function node
		function calculateComplexity(node) {
			// Start with complexity of 1 (for the function itself)
			let complexity = 1

			// A simpler way to calculate complexity - just count decision points
			function countDecisionPoints(node) {
				if (!node) return 0

				let count = 0

				// Count decision points based on node type
				switch (node.type) {
					case 'IfStatement':
						count++ // +1 for the if statement
						// Also count complexity in the condition
						if (node.test) {
							count += countDecisionPoints(node.test)
						}
						count += countDecisionPoints(node.consequent)
						count += countDecisionPoints(node.alternate)
						break

					case 'ForStatement':
					case 'ForInStatement':
					case 'ForOfStatement':
					case 'WhileStatement':
					case 'DoWhileStatement':
						count++ // +1 for the loop
						// Add complexity from the loop condition
						if (node.test) {
							count += countDecisionPoints(node.test)
						}
						count += countDecisionPoints(node.body)
						break

					case 'SwitchStatement':
						// Count each case as a decision point (except default)
						if (node.cases) {
							node.cases.forEach((caseNode) => {
								if (caseNode.test) {
									// Skip default case which has no test
									count++
								}
								if (caseNode.consequent) {
									caseNode.consequent.forEach((n) => {
										count += countDecisionPoints(n)
									})
								}
							})
						}
						break

					case 'ConditionalExpression': // ternary
						count++ // +1 for the ternary
						if (node.test) {
							count += countDecisionPoints(node.test)
						}
						count += countDecisionPoints(node.consequent)
						count += countDecisionPoints(node.alternate)
						break

					case 'LogicalExpression':
						if (node.operator === '&&' || node.operator === '||') {
							count++ // +1 for each logical operator
							if (debug) console.log(`Found LogicalExpression with operator ${node.operator}, adding 1 to count`)
						}
						count += countDecisionPoints(node.left)
						count += countDecisionPoints(node.right)
						break

					case 'BlockStatement':
						if (node.body) {
							node.body.forEach((n) => {
								count += countDecisionPoints(n)
							})
						}
						break

					// Other node types that can contain decision points
					case 'ExpressionStatement':
						count += countDecisionPoints(node.expression)
						break

					case 'ReturnStatement':
						if (node.argument) {
							count += countDecisionPoints(node.argument)
						}
						break

					case 'VariableDeclaration':
						if (node.declarations) {
							node.declarations.forEach((decl) => {
								if (decl.init) {
									count += countDecisionPoints(decl.init)
								}
							})
						}
						break

					case 'ArrayExpression':
						if (node.elements) {
							node.elements.forEach((element) => {
								if (element) count += countDecisionPoints(element)
							})
						}
						break

					case 'ObjectExpression':
						if (node.properties) {
							node.properties.forEach((prop) => {
								if (prop.value) count += countDecisionPoints(prop.value)
							})
						}
						break

					case 'CallExpression':
						if (node.arguments) {
							node.arguments.forEach((arg) => {
								count += countDecisionPoints(arg)
							})
						}
						break
				}

				return count
			}

			// Get the function body
			const body = node.body

			// Add decision points to base complexity of 1
			const decisionPoints = countDecisionPoints(body)
			complexity += decisionPoints

			if (debug) {
				const funcName = node.id ? node.id.name : 'anonymous function'
				console.log(
					`Function ${funcName} at line ${node.loc.start.line}: complexity = ${complexity}, threshold = ${threshold}`,
				)
				// Don't use JSON.stringify on AST nodes - they contain circular references
				console.log(`Function type: ${node.type}, body type: ${body.type}`)
			}

			return complexity
		}

		return {
			FunctionDeclaration(node) {
				const complexity = calculateComplexity(node)

				if (debug) {
					console.log(
						`Evaluating FunctionDeclaration ${node.id.name}: complexity = ${complexity}, threshold = ${threshold}`,
					)
				}

				if (complexity > threshold) {
					if (debug) console.log(`Reporting error for ${node.id ? node.id.name : 'anonymous'}`)
					context.report({
						node,
						message: createEnhancedMessage(node, threshold, complexity),
					})
				}
			},

			ArrowFunctionExpression(node) {
				const complexity = calculateComplexity(node)

				if (debug) {
					console.log(`Evaluating ArrowFunctionExpression: complexity = ${complexity}, threshold = ${threshold}`)
				}

				if (complexity > threshold) {
					if (debug) console.log(`Reporting error for arrow function`)
					context.report({
						node,
						message: createEnhancedMessage(node, threshold, complexity),
					})
				}
			},

			FunctionExpression(node) {
				const complexity = calculateComplexity(node)

				if (debug) {
					console.log(`Evaluating FunctionExpression: complexity = ${complexity}, threshold = ${threshold}`)
				}

				if (complexity > threshold) {
					if (debug) console.log(`Reporting error for function expression`)
					context.report({
						node,
						message: createEnhancedMessage(node, threshold, complexity),
					})
				}
			},

			MethodDefinition(node) {
				// Skip - the function expression will be handled
			},
		}
	},
}
