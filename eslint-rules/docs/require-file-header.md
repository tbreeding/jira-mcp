# Require File Header Rule

This rule enforces that files include a descriptive header comment at the top. The goal is to provide clear context about each file's purpose for both developers and AI agents working with the codebase.

## Rule Details

This rule checks for the presence of a header comment at the top of the file and validates that it meets length requirements. The comment should explain the purpose, responsibilities, and context of the file within the codebase.

### Good Examples

```typescript
/**
 * This module provides utility functions for handling date and time operations
 * throughout the application. It includes formatting, parsing, timezone conversion, 
 * and calendar-related calculations. These utilities ensure consistent date handling
 * across all features and help avoid common date manipulation errors.
 */
import { format } from 'date-fns';
// Rest of the file...
```

```typescript
/**
 * User authentication service that manages login, registration, and session handling.
 * This service interacts with the backend authentication API and maintains the user's
 * authentication state. It handles JWT token management, refresh logic, and provides
 * user identity information to other parts of the application.
 */
export class AuthService {
  // Implementation...
}
```

### Bad Examples

Missing header:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  // ...
}
```

Too short/uninformative:
```typescript
/**
 * User service.
 */
export class UserService {
  // Implementation...
}
```

## Configuration

The rule can be configured with the following options:

```js
// In eslint.config.js
module.exports = [
  {
    // ...other config
    rules: {
      'custom-rules/require-file-header': ['error', {
        // Patterns to include (using glob syntax)
        include: ['./src/**/*.ts'],
        
        // Patterns to exclude (using glob syntax)
        exclude: [
          './src/**/__tests__/**',
          './src/**/*.test.ts', 
          './src/**/*.spec.ts'
        ],
        
        // Minimum comment length (defaults to 50)
        minLength: 50,
        
        // Maximum comment length (defaults to 500)
        maxLength: 500
      }]
    }
  }
];
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `include` | string[] | `['./src/**/*.ts']` | File patterns to include (using glob syntax) |
| `exclude` | string[] | `['./src/**/__tests__/**', './src/**/*.test.ts', './src/**/*.spec.ts']` | File patterns to exclude (using glob syntax) |
| `minLength` | number | `50` | Minimum length of the header comment in characters |
| `maxLength` | number | `500` | Maximum length of the header comment in characters |

## Purpose

A good file header comment provides several benefits:

1. **Context for developers** - Quickly understand a file's purpose without reading all the code
2. **AI agent assistance** - Helps AI tools generate more accurate suggestions for the file
3. **Documentation** - Serves as living documentation that evolves with the code
4. **Onboarding** - Makes it easier for new team members to navigate the codebase
5. **Maintenance** - Helps maintainers understand if the file's implementation matches its intended purpose

The header comment should focus on the "what and why" rather than the "how" of the file's implementation. 