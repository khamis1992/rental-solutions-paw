const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Retrying operation. Attempts remaining: ${retries}`);
    await delay(delayMs);
    return retryOperation(operation, retries - 1, delayMs * 2);
  }
};