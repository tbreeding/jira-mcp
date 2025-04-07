/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	transform: {
		'^.+\\.(t|j)s$': '@swc/jest',
	},
	setupFiles: ['dotenv/config'],
	// globalSetup: '<rootDir>/src/test/testSetup.ts',
	// globalTeardown: '<rootDir>/src/test/testTeardown.ts',
	// setupFilesAfterEnv: ['<rootDir>/src/test/setupAfterEnv.ts'],
	testPathIgnorePatterns: ['/node_modules/', '/build/'],
	roots: ['<rootDir>/src'],
	modulePaths: ['src'],
	collectCoverageFrom: [
		'src/**/*',
		'!src/index.ts',
		'!src/server/index.ts',
		'!temp/**',
		'!src/tools/issueCreationWizard/manualTest.ts',
		'!src/**/*.script.ts',
		'!src/resources/definitions/**',
	],
	coverageReporters: ['text', 'lcov', 'text-summary'],
	coverageProvider: 'babel',
	coverageThreshold: {
		global: {
			statements: 100,
			branches: 100,
			functions: 100,
			lines: 100,
		},
	},
	testResultsProcessor: 'jest-sonar-reporter',
}
