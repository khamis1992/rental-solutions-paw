import { supabase } from "@/integrations/supabase/client";

export async function testTableAccess(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    return {
      success: !error,
      error: error?.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function testRlsPolicy(tableName: string, action: 'select' | 'insert' | 'update' | 'delete') {
  try {
    let query = supabase.from(tableName);
    
    switch (action) {
      case 'select':
        await query.select('*').limit(1);
        break;
      case 'insert':
        await query.insert({ test: true }).select();
        break;
      case 'update':
        await query.update({ updated: true }).eq('id', '00000000-0000-0000-0000-000000000000');
        break;
      case 'delete':
        await query.delete().eq('id', '00000000-0000-0000-0000-000000000000');
        break;
    }
    
    return true;
  } catch (error) {
    console.error(`RLS test failed for ${tableName} - ${action}:`, error);
    return false;
  }
}