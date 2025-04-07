/**
 * Logging Utility Module
 *
 * Provides standardized logging functionality with consistent formatting.
 */

import { config } from '../config'
import { initializeLogFolder } from './initializeLogFolder'
import { writeToLogFile } from './writeToLogFile'

if (config.logging.filePath) initializeLogFolder(config.logging.filePath)

export function log(message: string, error?: Error): void {
	if (process.env.NODE_ENV === 'test') {
		return
	}

	// Create prefix for log message
	const timestamp = new Date().toISOString()
	const logPrefix = `[${timestamp}] [PID:${process.pid}] `

	const logMessage = `${logPrefix}LOG: ${message}\n`

	const stackTrace = error ? getStackTrace(error) : ''
	const fullMessage = logMessage + stackTrace

	// Always write to stderr - This is a requirement for the MCP framework
	process.stderr.write(fullMessage)

	if (config.logging.filePath) writeToLogFile(config.logging.filePath, fullMessage)
}

function getStackTrace(error: Error): string {
	if (!error.stack) return ''

	const stackLines = error.stack.split('\n').slice(1)
	return `Stack trace:\n${stackLines.map((line) => `    ${line.trim()}`).join('\n')}\n`
}
