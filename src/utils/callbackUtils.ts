/**
 * Shared utility functions for common callback operations
 * These functions are defined outside components to prevent recreation
 */

export const handleBasicSort = (field: string, currentSort: string, setSort: (sort: string) => void) => {
  setSort(currentSort === field ? `-${field}` : field);
};

export const handleBasicFilter = (value: string, setFilter: (filter: string) => void) => {
  setFilter(value);
};

// Generic error handler that can be reused across components
export const handleError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);
  // Add your error handling logic here
};