// Example of code that would trigger the no-reexports ESLint rule

// Direct re-export (violation)
import { thing1 } from './module1';
export { thing1 };

// Re-export with renaming (violation)
import { thing2 } from './module2';
export { thing2 as renamedThing };

// Re-export via variable (violation)
import { thing3 } from './module3';
const reExport = thing3;
export { reExport };

// Direct re-export syntax (violation)
export { thing4 } from './module4';

// Export all (violation)
export * from './module5';

// Default export re-export (violation)
import thing6 from './module6';
export default thing6;

// Variable declaration export (violation)
import { thing7 } from './module7';
export const exportedThing = thing7; 