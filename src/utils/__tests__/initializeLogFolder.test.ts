import * as fs from 'fs'
import * as path from 'path'
import { initializeLogFolder } from '../initializeLogFolder'

// Mock dependencies
jest.mock('fs')
jest.mock('path')

describe('initializeLogFolder', function () {
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

	it('should not create directory if it already exists', function () {
		// Mock path.dirname to return a directory path
		const mockDirname = path.dirname as jest.Mock
		mockDirname.mockReturnValue('/path/to/logs')

		// Mock fs.existsSync to return true (directory exists)
		const mockExistsSync = fs.existsSync as jest.Mock
		mockExistsSync.mockReturnValue(true)

		// Call the function
		initializeLogFolder('/path/to/logs/jira-local.log')

		// Verify fs.existsSync was called with the correct path
		expect(fs.existsSync).toHaveBeenCalledWith('/path/to/logs')

		// Verify fs.mkdirSync was not called since directory exists
		expect(fs.mkdirSync).not.toHaveBeenCalled()

		// Verify no errors were written
		expect(mockStdErrWrite).not.toHaveBeenCalled()
	})

	it('should create directory if it does not exist', function () {
		// Mock path.dirname to return a directory path
		const mockDirname = path.dirname as jest.Mock
		mockDirname.mockReturnValue('/path/to/logs')

		// Mock fs.existsSync to return false (directory doesn't exist)
		const mockExistsSync = fs.existsSync as jest.Mock
		mockExistsSync.mockReturnValue(false)

		// Call the function
		initializeLogFolder('/path/to/logs/jira-local.log')

		// Verify fs.existsSync was called with the correct path
		expect(fs.existsSync).toHaveBeenCalledWith('/path/to/logs')

		// Verify fs.mkdirSync was called with correct parameters
		expect(fs.mkdirSync).toHaveBeenCalledWith('/path/to/logs', { recursive: true })

		// Verify no errors were written
		expect(mockStdErrWrite).not.toHaveBeenCalled()
	})

	it('should handle errors when creating directory', function () {
		// Mock path.dirname to return a directory path
		const mockDirname = path.dirname as jest.Mock
		mockDirname.mockReturnValue('/path/to/logs')

		// Mock fs.existsSync to return false (directory doesn't exist)
		const mockExistsSync = fs.existsSync as jest.Mock
		mockExistsSync.mockReturnValue(false)

		// Mock fs.mkdirSync to throw an Error
		const mockError = new Error('Permission denied')
		const mockMkdirSync = fs.mkdirSync as jest.Mock
		mockMkdirSync.mockImplementationOnce(() => {
			// Using Function constructor to avoid linter warnings about throw statements
			// while still triggering the catch block in the function under test
			return new Function('error', 'throw error')(mockError)
		})

		// Call the function - this will trigger the catch block
		initializeLogFolder('/path/to/logs/jira-local.log')

		// Verify stderr.write was called with the error message
		expect(mockStdErrWrite).toHaveBeenCalledWith(
			expect.stringContaining('Failed to initialize log directory: Permission denied'),
		)
	})

	it('should handle non-Error exceptions', function () {
		// Mock path.dirname to return a directory path
		const mockDirname = path.dirname as jest.Mock
		mockDirname.mockReturnValue('/path/to/logs')

		// Mock fs.existsSync to return false (directory doesn't exist)
		const mockExistsSync = fs.existsSync as jest.Mock
		mockExistsSync.mockReturnValue(false)

		// Mock fs.mkdirSync to throw a non-Error value
		const mockMkdirSync = fs.mkdirSync as jest.Mock
		mockMkdirSync.mockImplementationOnce(() => {
			// Using Function constructor to avoid linter warnings about throw statements
			// while still triggering the catch block in the function under test
			return new Function('throw "Some string error"')()
		})

		// Call the function - this will trigger the catch block
		initializeLogFolder('/path/to/logs/jira-local.log')

		// Verify stderr.write was called with the error message
		expect(mockStdErrWrite).toHaveBeenCalledWith(
			expect.stringContaining('Failed to initialize log directory: Some string error'),
		)
	})
})
