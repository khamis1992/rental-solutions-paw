import { supabase } from "@/integrations/supabase/client";

type TableNames = 
  | "profiles"
  | "accounting_categories"
  | "leases"
  | "vehicles"
  | "import_logs"
  | "payments"
  | "promotional_codes"
  | "help_guide_categories"
  | "legal_cases"
  | "legal_document_templates"
  | "legal_notification_templates"
  | "maintenance"
  | "maintenance_categories"
  | "vehicle_statuses";

export async function testTableAccess(tableName: TableNames) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`Error accessing ${tableName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error(`Error testing ${tableName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function testInsertAccess(tableName: TableNames, testData: any) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([testData])
      .select();

    if (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error(`Error testing insert for ${tableName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function testUpdateAccess(tableName: TableNames, id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Error updating ${tableName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error(`Error testing update for ${tableName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function testDeleteAccess(tableName: TableNames, id: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error(`Error testing delete for ${tableName}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}