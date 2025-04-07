import { validateRequiredArguments } from '../validatePromptArguments'
import { Success } from '../../../utils/try'
import type { PromptArgument, GetPromptArgs } from '../../definitions/prompt.types'

describe('validateRequiredArguments', () => {
	it('should return Success when definedArguments is undefined', () => {
		const result = validateRequiredArguments(undefined, {})
		expect(result).toEqual(Success(null))
	})

	it('should return Success when definedArguments is an empty array', () => {
		const result = validateRequiredArguments([], {})
		expect(result).toEqual(Success(null))
	})

	it('should return Success when no arguments are required', () => {
		const argsDef: PromptArgument[] = [
			{ name: 'arg1', required: false },
			{ name: 'arg2', required: false },
		]
		const result = validateRequiredArguments(argsDef, { arg1: 'value' })
		expect(result).toEqual(Success(null))
	})

	it('should return Success when all required arguments are provided', () => {
		const argsDef: PromptArgument[] = [
			{ name: 'req1', required: true },
			{ name: 'req2', required: true },
			{ name: 'opt1', required: false },
		]
		const provided: GetPromptArgs = { req1: 'hello', req2: 123 }
		const result = validateRequiredArguments(argsDef, provided)
		expect(result).toEqual(Success(null))
	})

	it('should return Success when a required argument is present with an empty string value', () => {
		const argsDef: PromptArgument[] = [{ name: 'req1', required: true }]
		const provided: GetPromptArgs = { req1: '' }
		const result = validateRequiredArguments(argsDef, provided)
		expect(result).toEqual(Success(null))
	})

	it('should return Success when a required argument is present with value 0', () => {
		const argsDef: PromptArgument[] = [{ name: 'req1', required: true }]
		const provided: GetPromptArgs = { req1: 0 }
		const result = validateRequiredArguments(argsDef, provided)
		expect(result).toEqual(Success(null))
	})

	it('should return Failure when a required argument is missing', () => {
		const argsDef: PromptArgument[] = [
			{ name: 'req1', required: true },
			{ name: 'req2', required: true },
		]
		const provided: GetPromptArgs = { req1: 'present' } // req2 is missing
		const result = validateRequiredArguments(argsDef, provided)
		expect(result.success).toBe(false)
		expect(result.error).toBeInstanceOf(Error)
		expect(result.error?.message).toBe("Missing required argument: 'req2'")
	})

	it('should return Failure when a required argument is provided as null', () => {
		const argsDef: PromptArgument[] = [{ name: 'req1', required: true }]
		const provided: GetPromptArgs = { req1: null }
		const result = validateRequiredArguments(argsDef, provided)
		expect(result.success).toBe(false)
		expect(result.error).toBeInstanceOf(Error)
		expect(result.error?.message).toBe("Missing required argument: 'req1'")
	})

	it('should return Failure when a required argument is provided as undefined', () => {
		const argsDef: PromptArgument[] = [{ name: 'req1', required: true }]
		const provided: GetPromptArgs = { req1: undefined }
		const result = validateRequiredArguments(argsDef, provided)
		expect(result.success).toBe(false)
		expect(result.error).toBeInstanceOf(Error)
		expect(result.error?.message).toBe("Missing required argument: 'req1'")
	})

	it('should return Failure when providedArgs is empty but arguments are required', () => {
		const argsDef: PromptArgument[] = [{ name: 'req1', required: true }]
		const result = validateRequiredArguments(argsDef, {})
		expect(result.success).toBe(false)
		expect(result.error).toBeInstanceOf(Error)
		expect(result.error?.message).toBe("Missing required argument: 'req1'")
	})

	it('should return Failure when providedArgs is undefined and arguments are required', () => {
		const argsDef: PromptArgument[] = [{ name: 'req1', required: true }]
		const result = validateRequiredArguments(argsDef, undefined)
		expect(result.success).toBe(false)
		expect(result.error).toBeInstanceOf(Error)
		expect(result.error?.message).toBe('No arguments provided')
	})
})
