// Example of a function with high cyclomatic complexity that would trigger the enhanced-complexity rule

function processData(data, options) {
  let result = [];
  
  if (!data) {
    return [];
  }
  
  if (options.filterEnabled) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      if (options.minValue && item.value < options.minValue) {
        continue;
      }
      
      if (options.maxValue && item.value > options.maxValue) {
        continue;
      }
      
      if (options.excludeCategories && options.excludeCategories.includes(item.category)) {
        continue;
      }
      
      if (options.onlyIncludeActive && !item.active) {
        continue;
      }
      
      if (options.textFilter && !item.name.includes(options.textFilter)) {
        continue;
      }
      
      if (options.dateRange) {
        if (options.dateRange.start && new Date(item.date) < new Date(options.dateRange.start)) {
          continue;
        }
        if (options.dateRange.end && new Date(item.date) > new Date(options.dateRange.end)) {
          continue;
        }
      }
      
      if (options.transform) {
        if (options.transform === 'uppercase') {
          item.name = item.name.toUpperCase();
        } else if (options.transform === 'lowercase') {
          item.name = item.name.toLowerCase();
        } else if (options.transform === 'capitalize') {
          item.name = item.name.charAt(0).toUpperCase() + item.name.slice(1);
        }
      }
      
      result.push(item);
    }
  } else {
    result = data;
  }
  
  if (options.sort) {
    if (options.sort === 'asc') {
      result.sort((a, b) => a.value - b.value);
    } else if (options.sort === 'desc') {
      result.sort((a, b) => b.value - a.value);
    } else if (options.sort === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  
  if (options.limit && result.length > options.limit) {
    result = result.slice(0, options.limit);
  }
  
  return result;
} 