/**
 * Custom ESLint plugin with rules specific to this project
 */
const noReexports = require('./no-reexports')
const enhancedComplexity = require('./enhanced-complexity')
const requireFileHeader = require('./require-file-header')
const noThrowStatements = require('./no-throw-statements')
const fileLength = require('./file-length')

module.exports = {
	rules: {
		'no-reexports': noReexports,
		'enhanced-complexity': enhancedComplexity,
		'require-file-header': requireFileHeader,
		'no-throw-statements': noThrowStatements,
		'file-length': fileLength,
	},
}
