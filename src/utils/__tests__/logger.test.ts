// We need to mock the modules before importing the logger

// Now import the logger module
import { initializeLogFolder } from '../initializeLogFolder'
import { writeToLogFile } from '../writeToLogFile'

jest.mock('fs')
jest.mock('path')
jest.mock('../../config', () => ({
	config: {
		logging: {
			filePath: '/path/to/logs/jira-local.log',
		},
	},
}))
jest.mock('../initializeLogFolder')
jest.mock('../writeToLogFile')

describe('Logger', function () {
	const originalNodeEnv = process.env.NODE_ENV
	let mockStdErrWrite: jest.SpyInstance

	beforeEach(() => {
		jest.clearAllMocks()

		mockStdErrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)
	})

	afterEach(() => {
		mockStdErrWrite.mockRestore()
		process.env.NODE_ENV = originalNodeEnv
		jest.restoreAllMocks()
	})

	describe('log function', function () {
		it('should suppress logs in test environment', function () {
			const { log } = jest.requireActual('../logger')
			process.env.NODE_ENV = 'test'

			log('Test message')

			expect(mockStdErrWrite).not.toHaveBeenCalled()
			expect(writeToLogFile).not.toHaveBeenCalled()
		})

		it('should write logs in non-test environment', function () {
			const { log } = jest.requireActual('../logger')

			process.env.NODE_ENV = 'development'

			log('Test message')

			expect(mockStdErrWrite).toHaveBeenCalledTimes(1)
			expect(writeToLogFile).toHaveBeenCalledTimes(1)
		})

		it('should write logs with timestamp and PID format', function () {
			const { log } = jest.requireActual('../logger')

			process.env.NODE_ENV = 'development'

			log('Test message')

			expect(mockStdErrWrite).toHaveBeenCalledTimes(1)
			const output = mockStdErrWrite.mock.calls[0][0]
			expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] \[PID:\d+\] LOG: Test message\n/)
		})

		it('should write logs to the log file when filePath is configured', function () {
			const { log } = jest.requireActual('../logger')
			process.env.NODE_ENV = 'development'

			log('Test message')

			expect(writeToLogFile).toHaveBeenCalledTimes(1)
			const mockWriteToLogFile = writeToLogFile as jest.Mock
			expect(mockWriteToLogFile.mock.calls[0][0]).toBe('/path/to/logs/jira-local.log')
			expect(mockWriteToLogFile.mock.calls[0][1]).toMatch('LOG: Test message')
		})
	})

	describe('getStackTrace function', function () {
		it('should format stack trace correctly when stack is available', function () {
			const { log } = jest.requireActual('../logger')

			process.env.NODE_ENV = 'development'

			const mockError = new Error()
			mockError.stack = 'Error\n    at line1\n    at line2'

			log('Test with stack trace', mockError)

			expect(mockStdErrWrite).toHaveBeenCalledTimes(1)
			const output = mockStdErrWrite.mock.calls[0][0]
			expect(output).toContain('Stack trace:\n    at line1\n    at line2\n')
		})

		it('should handle undefined stack trace', function () {
			const { log } = jest.requireActual('../logger')

			process.env.NODE_ENV = 'development'

			const mockError = new Error()
			Object.defineProperty(mockError, 'stack', { value: undefined })

			log('Test with undefined stack', mockError)

			expect(mockStdErrWrite).toHaveBeenCalledTimes(1)
			const output = mockStdErrWrite.mock.calls[0][0]
			expect(output).not.toContain('Stack trace:')
		})
	})

	describe('log directory initialization', function () {
		it('should initialize log folder when config has filePath', function () {
			// Use isolateModules to load logger in a clean context
			jest.isolateModules(() => {
				require('../logger')
			})

			// Now check if initializeLogFolder was called
			expect(initializeLogFolder).toHaveBeenCalledWith('/path/to/logs/jira-local.log')
		})
	})
})
