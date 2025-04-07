# Usage Examples: Generic Jira GET Tool

This document provides practical examples of how to use the Generic Jira GET Tool for various common Jira API operations. These examples illustrate the tool's flexibility and power across different use cases.

## Basic Examples

### 1. Fetching a Specific Issue

To retrieve detailed information about a specific issue:

```
Tool: jiraGet
Parameters:
  endpoint: /rest/api/3/issue/PROJ-123
```

### 2. Searching for Issues Using JQL

To search for issues using Jira Query Language (JQL):

```
Tool: jiraGet
Parameters:
  endpoint: /rest/api/3/search
  queryParams: {
    jql: "project = PROJ AND status = 'In Progress'",
    maxResults: 50,
    fields: ["summary", "status", "assignee"]
  }
```

### 3. Retrieving Project Information

To get detailed information about a specific project:

```
Tool: jiraGet
Parameters:
  endpoint: /rest/api/3/project/PROJ
```

### 4. Listing All Projects

To list all available projects:

```
Tool: jiraGet
Parameters:
  endpoint: /rest/api/3/project
```

## Advanced Examples

### 5. Getting User Information

To retrieve information about a specific user:

```
Tool: jiraGet
Parameters:
  endpoint: /rest/api/3/user
  queryParams: {
    accountId: "5b10a2844c20165700ede21g"
  }
```

### 6. Fetching All Issue Fields

To retrieve all available issue fields:

```
Tool: jiraGet
Parameters:
  endpoint: /rest/api/3/field
```

### 7. Retrieving Agile Board Information

To get information about a specific Agile board:

```
Tool: jiraGet
Parameters:
  endpoint: /rest/agile/1.0/board/123
```

### 8. Getting Sprint Details

To retrieve details about a specific sprint:

```
Tool: jiraGet
Parameters:
  endpoint: /rest/agile/1.0/sprint/456
```

### 9. Fetching Workflow Information

To get information about workflows:

```
Tool: jiraGet
Parameters:
  endpoint: /rest/api/3/workflow
```

### 10. Retrieving Issue Change History

To fetch the complete change history of an issue:

```
Tool: jiraGet
Parameters:
  endpoint: /rest/api/3/issue/PROJ-123/changelog
  queryParams: {
    startAt: 0,
    maxResults: 100
  }
```

## Common Use Cases

### Project Management

- List all projects a user has access to
- Get project role information
- Retrieve project versions and components

### Issue Management

- Search for issues with specific criteria
- Fetch issue details including custom fields
- Retrieve issue type information
- Get issue comments and attachments

### User Administration

- List users in a project or group
- Get information about specific users
- Retrieve user permissions

### Workflow and Status

- List available workflows
- Get status category information
- Retrieve transition information for issues

### Reporting

- Get time tracking information
- Retrieve worklog data
- Fetch issue statistics

## Tips for Effective Usage

1. Use precise JQL queries to minimize data transfer
2. Request only the specific fields you need
3. Use pagination for large result sets
4. Cache frequently requested data when appropriate
5. Handle rate limiting by implementing appropriate delays between requests 