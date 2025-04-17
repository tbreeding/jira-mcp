# Jira Issue Updating User Story

This document outlines a unified approach for updating Jira issues using the available tools and state management capabilities. Rather than treating updates to newly created issues and existing issues as separate workflows, we recognize they are fundamentally the same operation - both require simply fetching an issue and updating its fields.

The core API endpoint leveraged for these updates is: `PUT /rest/api/3/issue/{issueIdOrKey}`.

---

## Unified Issue Update User Story

**Goal:** As a user, I want to modify fields on any Jira issue, whether I've just created it or it already exists in Jira, using a single consistent mechanism.

**Key Principle:** All issue updates follow the same pattern: get the issue, load it into state, update fields, send to Jira API.

**Workflow Variations:**

### Variation 1: Update Issue After Creation

1. **Issue Creation:** Complete the issue creation process using the `issueCreationWizard` tools.
2. **Success & Issue Key:** The `createIssue` tool successfully creates the issue in Jira and returns the new `issueIdOrKey`.
3. **Update Request:** Express a desire to change something (e.g., "Set the priority to 'Highest'").
4. **Issue Fetching:** Use the returned `issueIdOrKey` to fetch the complete issue data from Jira.
5. **State Loading:** Load the issue data into the state manager.
6. **Field Modification:** Modify the target field(s) in the state.
7. **API Call:** Construct and send a `PUT` request to update only the changed fields.
8. **Feedback:** Inform whether the update was successful.

### Variation 2: Update Existing Issue

1. **Issue Fetching:** Fetch an issue using a tool like `getJiraIssue(issueKey='PROJ-123')`.
2. **State Loading:** Load the issue data into the state manager.
3. **Field Modification:** Identify and modify the target field(s) based on the user's request.
4. **API Call:** Construct and send a `PUT` request to update only the changed fields.
5. **Feedback:** Inform whether the update was successful.

---

## Implementation Principles

1. **Single Mechanism:** Use the same core function to update any issue, regardless of how we obtained the issue key.
2. **Consistent State Handling:** Load all issues into state in the same way before updating.
3. **Minimal API Calls:** Only send the changed fields to the Jira API.
4. **Clean Validation:** Verify we have an issue key and valid field values before attempting updates.

## Benefits

This unified approach offers several advantages:

1. **Simpler Code:** One mechanism instead of two for essentially the same operation.
2. **Reduced Duplication:** No need for parallel implementation paths.
3. **Consistent Experience:** Users get the same behavior regardless of context.
4. **Better Reliability:** A single, well-tested update path instead of multiple ones.
5. **Easier Maintenance:** Future changes only need to be made in one place.

By recognizing that updating a newly created issue and updating an existing issue are fundamentally the same operation with different entry points, we can create a more elegant and maintainable solution. 