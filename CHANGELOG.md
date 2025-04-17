# Changelog

## [1.0.0] - 2025-04-17

### Added
- Unified Jira issue update workflow: All updates (newly created and existing issues) now use a single, consistent mechanism and state manager. ([issue-updating-user-stories.md], [simplified-implementation-plan.md])
- New MCP tool: Load any existing Jira issue into the state manager for seamless updates.
- Comprehensive unit tests for update operations and orchestrators (100% coverage).
- Documentation for unified update workflow and implementation plan.

### Changed
- Refactored state management and update logic to eliminate code duplication between new and existing issue updates.
- Improved validation and error handling for all update operations.

### Notes
- Backward compatible: Existing workflows are preserved; new unified update path is now default.
- Clean code principles enforced: single responsibility, DRY, explicit error handling, and robust test coverage.

---
References: @issue-updating-user-stories.md, @simplified-implementation-plan.md 