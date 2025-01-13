import { supabase } from "@/integrations/supabase/client";

export const testTableAccess = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    return {
      canRead: !error,
      data: data,
      error: error?.message
    };
  } catch (error) {
    return {
      canRead: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};