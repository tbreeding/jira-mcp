/**
 * Simplified version of the require-file-header rule for testing
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
          minLength: {
            type: 'integer',
            minimum: 1,
          },
          maxLength: {
            type: 'integer',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingHeader: 'File is missing a required header comment. Please add a comment at the top of the file (between {{minLength}} and {{maxLength}} characters) that describes the purpose and functionality of this file.',
      headerTooShort: 'File header comment is too short ({{commentLength}} chars). Please expand the comment to be at least {{minLength}} characters long.',
      headerTooLong: 'File header comment is too long ({{commentLength}} chars). Please shorten the comment to be at most {{maxLength}} characters.',
    },
  },
  create: function (context) {
    // Get options or set defaults
    const options = context.options[0] || {};
    const minLength = options.minLength || 50;
    const maxLength = options.maxLength || 500;
    
    // Get the source code object
    const sourceCode = context.getSourceCode();
    
    return {
      Program(node) {
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