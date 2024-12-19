import { ImportErrors } from './importTypes';
import { Json } from '@/integrations/supabase/types';

export const parseImportErrors = (errors: Json): ImportErrors | null => {
  if (!errors || typeof errors !== 'object') {
    return null;
  }

  try {
    // Ensure the object has the expected structure
    const parsed = errors as any;
    return {
      skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
      failed: Array.isArray(parsed.failed) ? parsed.failed : []
    };
  } catch (error) {
    console.error('Error parsing import errors:', error);
    return null;
  }
};

export const retryImportOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
      }
    }
  }
  
  throw lastError;
};