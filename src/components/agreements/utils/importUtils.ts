import { ImportErrors } from './importTypes';
import { Json } from '@/integrations/supabase/types';

export const parseImportErrors = (errors: Json): ImportErrors | null => {
  if (!errors || typeof errors !== 'object') {
    console.warn('Invalid errors object received:', errors);
    return null;
  }

  try {
    const parsed = errors as Record<string, unknown>;
    
    if (!parsed.skipped || !Array.isArray(parsed.skipped) || 
        !parsed.failed || !Array.isArray(parsed.failed)) {
      console.warn('Invalid errors structure:', parsed);
      return null;
    }

    return {
      skipped: parsed.skipped,
      failed: parsed.failed
    };
  } catch (error) {
    console.error('Error parsing import errors:', error);
    return null;
  }
};

export const retryImportOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        const baseDelay = initialDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;
        
        console.log(`Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after all retries');
};