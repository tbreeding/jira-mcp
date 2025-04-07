/**
 * Result Type Implementation
 *
 * This module implements a functional Result (Try) type pattern for error handling.
 * It provides a type-safe way to represent operations that might succeed or fail,
 * without resorting to exceptions. The Result pattern encourages explicit error
 * handling and enables consumers to safely process both success and failure cases
 * in a consistent manner throughout the application.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Try<Success = never, Failure = Success> = SuccessMaybe<Success> | FailureMaybe<Failure>

interface FailureMaybe<T = any> {
	success: false
	value?: T
	error: Error
}

interface SuccessMaybe<T = any> {
	success: true
	value: T
	error?: never
}

export function Success<T>(value: T): SuccessMaybe<T> {
	return {
		success: true,
		value,
	}
}

export function Failure<T>(error: Error, value?: T): FailureMaybe<T> {
	return {
		success: false,
		value,
		error,
	}
}

export default Try
