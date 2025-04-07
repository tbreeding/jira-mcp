// Refactored version of the high complexity function, following the suggestions from the enhanced-complexity rule

// Helper function to check if an item meets filter criteria
function meetsFilterCriteria(item, options) {
  // Check min value
  if (options.minValue && item.value < options.minValue) {
    return false;
  }
  
  // Check max value
  if (options.maxValue && item.value > options.maxValue) {
    return false;
  }
  
  // Check excluded categories
  if (options.excludeCategories && options.excludeCategories.includes(item.category)) {
    return false;
  }
  
  // Check active status
  if (options.onlyIncludeActive && !item.active) {
    return false;
  }
  
  // Check text filter
  if (options.textFilter && !item.name.includes(options.textFilter)) {
    return false;
  }
  
  // Check date range
  if (options.dateRange) {
    if (options.dateRange.start && new Date(item.date) < new Date(options.dateRange.start)) {
      return false;
    }
    if (options.dateRange.end && new Date(item.date) > new Date(options.dateRange.end)) {
      return false;
    }
  }
  
  return true;
}

// Helper function to transform an item
function transformItem(item, transformType) {
  const transformed = { ...item };
  
  switch (transformType) {
    case 'uppercase':
      transformed.name = transformed.name.toUpperCase();
      break;
    case 'lowercase':
      transformed.name = transformed.name.toLowerCase();
      break;
    case 'capitalize':
      transformed.name = transformed.name.charAt(0).toUpperCase() + transformed.name.slice(1);
      break;
    default:
      // No transformation
      break;
  }
  
  return transformed;
}

// Helper function to sort results
function sortResults(items, sortType) {
  const sorted = [...items];
  
  switch (sortType) {
    case 'asc':
      return sorted.sort((a, b) => a.value - b.value);
    case 'desc':
      return sorted.sort((a, b) => b.value - a.value);
    case 'alphabetical':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

// Main function with reduced complexity
function processData(data, options) {
  // Early return for empty data
  if (!data) {
    return [];
  }
  
  // Apply filtering
  let result = options.filterEnabled
    ? data.filter(item => meetsFilterCriteria(item, options))
    : [...data];
  
  // Apply transformations
  if (options.transform) {
    result = result.map(item => transformItem(item, options.transform));
  }
  
  // Apply sorting
  if (options.sort) {
    result = sortResults(result, options.sort);
  }
  
  // Apply limit
  if (options.limit && result.length > options.limit) {
    result = result.slice(0, options.limit);
  }
  
  return result;
} 