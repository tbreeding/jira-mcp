import * as fs from 'fs'
import { writeToLogFile } from '../writeToLogFile'

// Mock dependencies
jest.mock('fs')

describe('writeToLogFile', function () {
	// Spy on process.stderr.write
	let mockStdErrWrite: jest.SpyInstance

	beforeEach(() => {
		jest.clearAllMocks()
		mockStdErrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)
	})

	afterEach(() => {
		mockStdErrWrite.mockRestore()
		jest.restoreAllMocks()
	})

	it('should write message to log file successfully', function () {
		// Mock fs.appendFileSync to do nothing (successful write)
		const mockAppendFileSync = fs.appendFileSync as jest.Mock

		// Call the function
		const logMessage = 'Test log message'
		writeToLogFile('/path/to/logs/jira-local.log', logMessage)

		// Verify appendFileSync was called with correct parameters
		expect(mockAppendFileSync).toHaveBeenCalledWith('/path/to/logs/jira-local.log', logMessage)

		// Verify no errors were written
		expect(mockStdErrWrite).not.toHaveBeenCalled()
	})

	it('should handle error when writing to log file fails', function () {
		// Mock fs.appendFileSync to throw an Error
		const mockError = new Error('Permission denied')
		const mockAppendFileSync = fs.appendFileSync as jest.Mock
		mockAppendFileSync.mockImplementationOnce(() => {
			// Using Function constructor to avoid linter warnings about throw statements
			// while still triggering the catch block in the function under test
			return new Function('error', 'throw error')(mockError)
		})

		// Call the function
		writeToLogFile('/path/to/logs/jira-local.log', 'Test log message')

		// Verify stderr.write was called with the error message
		expect(mockStdErrWrite).toHaveBeenCalledWith(
			expect.stringContaining('Failed to write to log file: Permission denied'),
		)
	})

	it('should handle non-Error exceptions', function () {
		// Mock fs.appendFileSync to throw a non-Error
		const mockAppendFileSync = fs.appendFileSync as jest.Mock
		mockAppendFileSync.mockImplementationOnce(() => {
			// Using Function constructor to avoid linter warnings about throw statements
			// while still triggering the catch block in the function under test
			return new Function('throw "Some string error"')()
		})

		// Call the function
		writeToLogFile('/path/to/logs/jira-local.log', 'Test log message')

		// Verify stderr.write was called with the error message
		expect(mockStdErrWrite).toHaveBeenCalledWith(
			expect.stringContaining('Failed to write to log file: Some string error'),
		)
	})
})
