import { supabase } from "@/integrations/supabase/client";

type TableNames = 'unified_payments' | 'unified_import_tracking' | 'accounting_categories';

export const testTableAccess = async (tableName: TableNames) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`Error accessing ${tableName}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error testing ${tableName} access:`, error);
    return false;
  }
};
