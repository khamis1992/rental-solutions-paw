import { supabase } from "@/integrations/supabase/client";

export const testTableAccess = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    return {
      canRead: !error,
      data: data
    };
  } catch (error) {
    return {
      canRead: false,
      error
    };
  }
};

export const testTableWrite = async (tableName: string) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .insert({})
      .select()
      .single();

    return {
      canWrite: !error
    };
  } catch (error) {
    return {
      canWrite: false,
      error
    };
  }
};

export const testTableDelete = async (tableName: string) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', 'test-id');

    return {
      canDelete: !error
    };
  } catch (error) {
    return {
      canDelete: false,
      error
    };
  }
};