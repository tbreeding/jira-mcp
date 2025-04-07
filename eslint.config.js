const typescript = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const prettierPlugin = require('eslint-plugin-prettier')
const importPlugin = require('eslint-plugin-import')
const customRules = require('./eslint-rules')

module.exports = [
	{
		ignores: [
			'.eslintrc.js',
			'eslint.config.cjs',
			'jest.config.js',
			'dist/**',
			'node_modules/**',
			'build/**',
			'temp/**',
		],
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: 'tsconfig.json',
				sourceType: 'module',
			},
			globals: {
				node: true,
				jest: true,
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
			prettier: prettierPlugin,
			import: importPlugin,
			'custom-rules': customRules,
		},
		rules: {
			// Type imports and exports
			'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
			'@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: true }],

			// Use enhanced complexity rule instead of the default one
			complexity: 'off', // Turn off the built-in rule
			'custom-rules/enhanced-complexity': ['error', 6],

			// Function return types - relaxed for now
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/explicit-module-boundary-types': 'error',
			'@typescript-eslint/no-explicit-any': 'error',

			// Import sorting and organization
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
					pathGroups: [
						{
							pattern: '{@typescript/**,type/**,*/types,*/interfaces,**/*.types,**/*.interface}',
							group: 'type',
							position: 'after',
						},
					],
					'newlines-between': 'never',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
					warnOnUnassignedImports: true,
				},
			],
			'import/no-duplicates': 'error',
			'import/no-unused-modules': 'error',

			// Custom rules
			'custom-rules/require-file-header': [
				'error',
				{
					include: ['./src/**/*.ts'],
					exclude: ['./src/**/__tests__/**', './src/**/*.test.ts', './src/**/*.spec.ts'],
					minLength: 50,
					maxLength: 600,
				},
			],
			'custom-rules/no-reexports': 'error',
			'custom-rules/no-throw-statements': [
				'error',
				{
					allowList: ['**/__tests__/**', '**/*.test.ts', '**/*.spec.ts'],
					allowInCatchBlocks: false,
				},
			],
			'custom-rules/file-length': [
				'error',
				{
					maxLines: 100,
					ignorePatterns: ['*.test.ts', '*.spec.ts', '*.stories.ts', '*.types.ts'],
				},
			],

			// Additional strictness - relaxed
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-inferrable-types': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/ban-ts-comment': 'warn',
			'no-console': 'error',
			'no-debugger': 'error',

			// Style
			'prettier/prettier': 'error',
		},
	},
	// Add specific rules for test files
	{
		files: ['**/*.test.ts', '**/__tests__/**/*.ts'],
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',
			'no-console': 'off',
			'no-debugger': 'off',
			'custom-rules/no-throw-statements': 'off',
			'import/order': 'off',
		},
	},
]
