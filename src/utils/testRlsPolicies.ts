import { supabase } from "@/integrations/supabase/client";

export const testTableAccess = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    return {
      canRead: !error,
      error: error?.message
    };
  } catch (error) {
    return {
      canRead: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const testWriteAccess = async (tableName: string) => {
  try {
    // First try to insert a test record
    const { error: insertError } = await supabase
      .from(tableName)
      .insert({})
      .select()
      .single();

    return {
      canWrite: !insertError,
      error: insertError?.message
    };
  } catch (error) {
    return {
      canWrite: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};