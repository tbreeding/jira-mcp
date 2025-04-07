// Example of code that would NOT trigger the no-reexports ESLint rule

// Original exports, not re-exports
export const foo = 'bar';
export function doSomething() { return true; }

// Not re-exporting imported items
import { thing } from './module';
export const otherThing = 'value';

// Modifying or enhancing the imported item before exporting
import { importedObject } from './module';
export const enhancedObject = { ...importedObject, extraProp: true };

// Exporting a combination of imports and original values
import { importedValue } from './module';
export const combined = {
  importedValue, // Used as part of a larger object
  extraStuff: 'value'
};

// Processing imported value before exporting
import { number } from './module';
export const doubled = number * 2;

// Using imported function to create exportable value
import { createValue } from './module';
export const valueFromImport = createValue() + ' with additional processing'; 