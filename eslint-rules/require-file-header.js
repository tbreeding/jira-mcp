/**
 * ESLint rule that requires a file header comment at the top of files
 * to provide context for people and AI agents working in the codebase.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce the presence of a descriptive file header comment',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          include: {
            type: 'array',
            items: { type: 'string' },
            description: 'File patterns to include in this rule (using minimatch syntax)',
          },
          exclude: {
            type: 'array',
            items: { type: 'string' },
            description: 'File patterns to exclude from this rule (using minimatch syntax)',
          },
          minLength: {
            type: 'integer',
            minimum: 1,
            description: 'Minimum length of the header comment in characters',
          },
          maxLength: {
            type: 'integer',
            minimum: 1,
            description: 'Maximum length of the header comment in characters',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingHeader: 'File is missing a required header comment. Please add a comment at the top of the file (between {{minLength}} and {{maxLength}} characters) that describes the purpose and functionality of this file. This documentation helps both developers and AI agents understand the context and role of this file within the codebase.',
      headerTooShort: 'File header comment is too short ({{commentLength}} chars). Please expand the comment to be at least {{minLength}} characters long, providing more detail about the file\'s purpose, functionality, and context within the codebase.',
      headerTooLong: 'File header comment is too long ({{commentLength}} chars). Please shorten the comment to be at most {{maxLength}} characters while still clearly describing the file\'s purpose and functionality.',
    },
  },
  create: function (context) {
    // Get options or set defaults
    const options = context.options[0] || {};
    const minLength = options.minLength || 50;
    const maxLength = options.maxLength || 500;
    const include = options.include || ['./src/**/*.ts'];
    const exclude = options.exclude || ['./src/**/__tests__/**', './src/**/*.test.ts', './src/**/*.spec.ts'];
    
    // Get the source code object
    const sourceCode = context.getSourceCode();
    
    // Check if the file should be processed based on include/exclude patterns
    const filename = context.getFilename();
    
    // Simple minimatch-like check (basic implementation)
    function minimatchCheck(filepath, pattern) {
      // Normalize pattern by removing leading ./
      const normalizedPattern = pattern.replace(/^\.\//, '');
      
      // Convert glob patterns to RegExp
      // This is a simplified implementation - in real code you might use the actual 'minimatch' library
      const regexPattern = normalizedPattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '___GLOBSTAR___')
        .replace(/\*/g, '[^/]*')
        .replace(/___GLOBSTAR___/g, '.*')
        .replace(/\//g, '\\/');
        
      const regex = new RegExp(regexPattern);
      return regex.test(filepath);
    }
    
    const shouldProcess = (
      include.some(pattern => minimatchCheck(filename, pattern)) &&
      !exclude.some(pattern => minimatchCheck(filename, pattern))
    );
    
    return {
      Program(node) {
        // Skip processing if file doesn't match patterns
        if (!shouldProcess) return;
        
        const comments = sourceCode.getAllComments();
        
        // Look for a header comment at the top of the file
        const headerComment = comments.find(comment => {
          // Check if this is the first comment
          return comment.loc.start.line === 1 || 
                 // Or if it's preceded only by shebang
                 (comment.loc.start.line === 2 && 
                  sourceCode.getText().trimStart().startsWith('#!'));
        });
        
        if (!headerComment) {
          context.report({
            node: node,
            messageId: 'missingHeader',
            data: { minLength, maxLength }
          });
          return;
        }
        
        // Check the comment's length
        const commentText = headerComment.value.trim();
        const commentLength = commentText.length;
        
        if (commentLength < minLength) {
          context.report({
            node: headerComment,
            messageId: 'headerTooShort',
            data: { commentLength, minLength }
          });
        } else if (commentLength > maxLength) {
          context.report({
            node: headerComment,
            messageId: 'headerTooLong',
            data: { commentLength, maxLength }
          });
        }
      }
    };
  }
}; 