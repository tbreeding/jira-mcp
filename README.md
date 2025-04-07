# Typescript Boilerplate
`npm install`
`npm run node:swc -- ./src/index.ts`

The gitlab pipelines have already been setup to run similar to the Parsers-TS project.

Jest is already setup, just write tests and run:
`npm test`

## Available Tools

This application exposes the following tools via the Model Context Protocol:

### Core Jira Tools

- `getJiraIssue`: Fetches a Jira issue by its key.
- `analyzeJiraIssue`: Performs comprehensive analysis of a Jira issue.
- `jiraGet`: Fetches data from any Jira API GET endpoint.
- `getIssuesByJql`: Searches for Jira issues using a JQL query.

### Issue Creation Wizard Tools

- `mcp_IssueCreationWizard_getState`: Gets the current internal state of the wizard.
- `mcp_IssueCreationWizard_getStatus`: Gets the high-level status of the wizard.
- `mcp_IssueCreationWizard_initiateState`: Initializes a new wizard state.
- `mcp_IssueCreationWizard_resetState`: Resets the wizard state.
- `mcp_IssueCreationWizard_updateState`: Updates the wizard state (project, issue type, fields, step).
- `mcp_IssueCreationWizard_createIssue`: Creates a Jira issue using the wizard's state.
- `mcp_IssueCreationWizard_getProjects`: Retrieves available Jira projects.
- `mcp_IssueCreationWizard_getIssueTypes`: Gets available issue types for the selected project.
- `mcp_IssueCreationWizard_getFields`: Retrieves fields required for the selected project/issue type.
- `mcp_IssueCreationWizard_updateFields`: Updates specific field values in the wizard state.
- `mcp_IssueCreationWizard_setAnalysisComplete`: Sets the analysis complete flag.
- `mcp_IssueCreationWizard_setUserConfirmation`: Sets the user confirmation flag before creation.
- `mcp_IssueCreationWizard_analyzeIssue`: Analyzes the issue details within the wizard context.

## Environment Variables

### Jira Integration

This application requires the following command line arguments for Jira integration:

- `JIRA_BASE_URL`: Your Jira instance URL (e.g., https://your-jira-instance.atlassian.net)
- `JIRA_USERNAME`: Your Jira username/email
- `JIRA_API_TOKEN`: Your Jira API token

### Development with MCP Inspector

For development using the Model Context Protocol Inspector, you can pass environment variables using the `-e` flag:

```bash
npx @modelcontextprotocol/inspector -e JIRA_BASE_URL=https://your-jira-instance.atlassian.net -e JIRA_USERNAME=your-email@example.com -e JIRA_API_TOKEN=your-api-token -e DEBUG=true node build/index.js
```