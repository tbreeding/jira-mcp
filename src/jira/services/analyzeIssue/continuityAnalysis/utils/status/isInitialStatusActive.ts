/**
 * Initial Status Activity Module
 *
 * This module provides functionality for determining whether
 * an initial status value represents active work.
 */
import { isActiveStatus } from '../isActiveStatus'

/**
 * Determines if the initial status is active
 *
 * @param status - The status to check
 * @returns True if the status is active
 */
export function isInitialStatusActive(status: string | null): boolean {
	return status ? isActiveStatus(status) : false
}
