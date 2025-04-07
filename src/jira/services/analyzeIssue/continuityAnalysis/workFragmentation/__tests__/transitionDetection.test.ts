import * as isActiveStatusModule from '../../utils/isActiveStatus'
import { isTransitionToActive, isTransitionFromActive } from '../transitionDetection'

// Mock dependencies
jest.mock('../../utils/isActiveStatus')

describe('transitionDetection', () => {
	// Setup mocks
	const mockIsActiveStatus = jest.spyOn(isActiveStatusModule, 'isActiveStatus')

	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('isTransitionToActive', () => {
		test('should return true when transitioning to active status', () => {
			// Arrange
			const inActiveStatus = false
			const newStatus = 'In Progress'

			// Mock isActiveStatus to return true
			mockIsActiveStatus.mockReturnValue(true)

			// Act
			const result = isTransitionToActive(inActiveStatus, newStatus)

			// Assert
			expect(result).toBe(true)
			expect(mockIsActiveStatus).toHaveBeenCalledWith(newStatus)
		})

		test('should return false when already in active status', () => {
			// Arrange
			const inActiveStatus = true
			const newStatus = 'In Progress'

			// Mock isActiveStatus to return true
			mockIsActiveStatus.mockReturnValue(true)

			// Act
			const result = isTransitionToActive(inActiveStatus, newStatus)

			// Assert
			expect(result).toBe(false)
			expect(mockIsActiveStatus).not.toHaveBeenCalled()
		})

		test('should return false when new status is not active', () => {
			// Arrange
			const inActiveStatus = false
			const newStatus = 'To Do'

			// Mock isActiveStatus to return false
			mockIsActiveStatus.mockReturnValue(false)

			// Act
			const result = isTransitionToActive(inActiveStatus, newStatus)

			// Assert
			expect(result).toBe(false)
			expect(mockIsActiveStatus).toHaveBeenCalledWith(newStatus)
		})

		test('should return false when new status is null', () => {
			// Arrange
			const inActiveStatus = false
			const newStatus = null

			// Act
			const result = isTransitionToActive(inActiveStatus, newStatus)

			// Assert
			expect(result).toBe(false)
			expect(mockIsActiveStatus).not.toHaveBeenCalled()
		})
	})

	describe('isTransitionFromActive', () => {
		test('should return true when transitioning from active status', () => {
			// Arrange
			const inActiveStatus = true
			const activePeriodStart = new Date('2023-01-01T00:00:00.000Z')
			const newStatus = 'Done'

			// Mock isActiveStatus to return false for the new status
			mockIsActiveStatus.mockReturnValue(false)

			// Act
			const result = isTransitionFromActive(inActiveStatus, activePeriodStart, newStatus)

			// Assert
			expect(result).toBe(true)
			expect(mockIsActiveStatus).toHaveBeenCalledWith(newStatus)
		})

		test('should return false when not in active status', () => {
			// Arrange
			const inActiveStatus = false
			const activePeriodStart = new Date('2023-01-01T00:00:00.000Z')
			const newStatus = 'Done'

			// Act
			const result = isTransitionFromActive(inActiveStatus, activePeriodStart, newStatus)

			// Assert
			expect(result).toBe(false)
			expect(mockIsActiveStatus).not.toHaveBeenCalled()
		})

		test('should return false when activePeriodStart is null', () => {
			// Arrange
			const inActiveStatus = true
			const activePeriodStart = null
			const newStatus = 'Done'

			// Act
			const result = isTransitionFromActive(inActiveStatus, activePeriodStart, newStatus)

			// Assert
			expect(result).toBe(false)
			expect(mockIsActiveStatus).not.toHaveBeenCalled()
		})

		test('should return false when new status is null', () => {
			// Arrange
			const inActiveStatus = true
			const activePeriodStart = new Date('2023-01-01T00:00:00.000Z')
			const newStatus = null

			// Act
			const result = isTransitionFromActive(inActiveStatus, activePeriodStart, newStatus)

			// Assert
			expect(result).toBe(false)
			expect(mockIsActiveStatus).not.toHaveBeenCalled()
		})

		test('should return false when new status is still active', () => {
			// Arrange
			const inActiveStatus = true
			const activePeriodStart = new Date('2023-01-01T00:00:00.000Z')
			const newStatus = 'In Progress'

			// Mock isActiveStatus to return true for the new status
			mockIsActiveStatus.mockReturnValue(true)

			// Act
			const result = isTransitionFromActive(inActiveStatus, activePeriodStart, newStatus)

			// Assert
			expect(result).toBe(false)
			expect(mockIsActiveStatus).toHaveBeenCalledWith(newStatus)
		})
	})
})
