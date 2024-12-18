const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
  backoffFactor = 2
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    
    // Log the error for debugging
    console.warn(`Operation failed, retrying... Attempts remaining: ${retries}`, error);
    
    // For network errors, wait a bit longer
    const actualDelay = error instanceof TypeError && error.message === 'Failed to fetch'
      ? delayMs * 2
      : delayMs;
    
    await delay(actualDelay);
    return retryOperation(operation, retries - 1, delayMs * backoffFactor);
  }
};