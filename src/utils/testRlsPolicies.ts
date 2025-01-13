import { supabase } from "@/integrations/supabase/client";

export interface RlsTestResult {
  success: boolean;
  error?: string;
}

export const testRlsPolicies = async (tableName: string): Promise<RlsTestResult> => {
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const testTableOperations = async (tableName: string): Promise<RlsTestResult> => {
  try {
    // Test read
    const { error: readError } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(1);

    if (readError) {
      return {
        success: false,
        error: `Read failed: ${readError.message}`
      };
    }

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};