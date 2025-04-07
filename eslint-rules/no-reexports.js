/**
 * ESLint rule to prevent re-exporting of imported identifiers
 */
module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow re-exporting of imported identifiers',
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
					},
					allowModules: {
						type: 'array',
						items: { type: 'string' },
					},
					allowRenamed: {
						type: 'boolean',
					},
				},
				additionalProperties: false,
			},
		],
	},
	create: function (context) {
		const options = context.options[0] || {}
		const allowList = new Set(options.allowList || [])
		const allowModules = new Set(options.allowModules || [])
		const allowRenamed = options.allowRenamed || false

		// Maps to track imported identifiers and their source modules
		const importedIdentifiers = new Map() // name -> source

		// Track variables to handle complex re-exports
		const variableSources = new Map() // variable name -> imported source

		return {
			// Track imports
			ImportDeclaration(node) {
				const source = node.source.value
				const isAllowedModule = allowModules.has(source)

				node.specifiers.forEach((specifier) => {
					const name = specifier.local.name
					if (!allowList.has(name) && !isAllowedModule) {
						importedIdentifiers.set(name, source)
					}
				})
			},

			// Track variable declarations that reference imports
			VariableDeclarator(node) {
				if (node.init && node.init.type === 'Identifier') {
					const source = importedIdentifiers.get(node.init.name)
					if (source) {
						variableSources.set(node.id.name, source)
					}
				}
			},

			// Check named exports
			ExportNamedDeclaration(node) {
				// Direct re-export with source
				if (node.source) {
					const source = node.source.value
					if (!allowModules.has(source)) {
						node.specifiers.forEach((specifier) => {
							context.report({
								node: specifier,
								message: `Passthrough export from '${source}' is not allowed. Passthrough files add complexity without value. Remove this re-export and import directly from '${source}' where needed.`,
							})
						})
					}
					return
				}

				// Standard named exports
				node.specifiers.forEach((specifier) => {
					const name = specifier.local.name
					const exported = specifier.exported.name
					const isRenamed = name !== exported

					if (importedIdentifiers.has(name)) {
						if (!(allowRenamed && isRenamed)) {
							const source = importedIdentifiers.get(name)
							context.report({
								node: specifier,
								message: `Passthrough export of '${name}' from '${source}' is not allowed. Modules should add value, not just re-export. Remove this re-export and update affected imports to use '${source}' directly.`,
							})
						}
					} else if (variableSources.has(name)) {
						if (!(allowRenamed && isRenamed)) {
							const source = variableSources.get(name)
							context.report({
								node: specifier,
								message: `Passthrough export of '${name}' which wraps an import from '${source}' is not allowed. Remove this variable and re-export pattern and update imports to reference '${source}' directly.`,
							})
						}
					}
				})

				// Check variable declaration exports
				if (node.declaration && node.declaration.type === 'VariableDeclaration') {
					node.declaration.declarations.forEach((declarator) => {
						if (declarator.init && declarator.init.type === 'Identifier') {
							const initName = declarator.init.name
							if (importedIdentifiers.has(initName)) {
								const source = importedIdentifiers.get(initName)
								context.report({
									node: declarator,
									message: `Passthrough export of '${initName}' from '${source}' via variable declaration is not allowed. Add meaningful transformation or remove this pattern entirely. Update affected imports to use '${source}' directly.`,
								})
							}
						}
					})
				}
			},

			// Check export all declarations
			ExportAllDeclaration(node) {
				const source = node.source.value
				if (!allowModules.has(source)) {
					context.report({
						node,
						message: `Exporting all from '${source}' is not allowed. This creates hard-to-track dependencies. Import and export specific items with added value, or update affected imports to use '${source}' directly.`,
					})
				}
			},

			// Check default exports
			ExportDefaultDeclaration(node) {
				if (node.declaration && node.declaration.type === 'Identifier') {
					const name = node.declaration.name
					if (importedIdentifiers.has(name)) {
						const source = importedIdentifiers.get(name)
						context.report({
							node,
							message: `Passthrough default export of '${name}' from '${source}' is not allowed. Default exports should provide value, not just re-export. Remove this file or add functionality before exporting.`,
						})
					} else if (variableSources.has(name)) {
						const source = variableSources.get(name)
						context.report({
							node,
							message: `Passthrough default export of '${name}' which wraps an import from '${source}' is not allowed. Remove this pattern and update imports to reference '${source}' directly.`,
						})
					}
				}
			},
		}
	},
}
