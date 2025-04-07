/**
 * Prompt Argument Validation Utility
 *
 * Provides a reusable function to validate provided arguments against a prompt's
 * argument definition, specifically checking for the presence of required arguments.
 */

import { Success, Failure } from '../../utils/try'
import type Try from '../../utils/try'
import type { PromptArgument, GetPromptArgs } from '../definitions/prompt.types'

/**
 * Validates provided arguments against the prompt definition, ensuring all required
 * arguments are present.
 *
 * @param definedArguments The array of argument definitions from the prompt.
 * @param providedArgs The arguments received in the request.
 * @returns A Try object: Success(null) if valid, Failure(Error) if validation fails.
 */
export function validateRequiredArguments(
	definedArguments: Readonly<PromptArgument[]> | undefined,
	providedArgs?: GetPromptArgs,
): Try<null> {
	const requiredArgs = definedArguments?.filter((arg) => arg.required) ?? []

	if (requiredArgs.length === 0) {
		return Success(null)
	}

	if (!providedArgs) return Failure(new Error('No arguments provided'))

	const missingArg = requiredArgs.find((argDef) => {
		const value = providedArgs[argDef.name]
		return value === undefined || value === null
	})

	if (missingArg) {
		return Failure(new Error(`Missing required argument: '${missingArg.name}'`))
	}

	return Success(null)
}
