import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TestResult {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  success: boolean;
  error?: string;
}

export const testRlsPolicies = async (): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  
  // Test tables with RLS
  const tablesToTest = [
    'ai_payment_analysis',
    'csv_import_mappings',
    'document_analysis_logs',
    'expense_categories',
    'expense_transactions',
    'financial_forecasts',
    'financial_insights',
    'fixed_costs',
    'installment_analytics',
    'payment_reconciliation',
    'rent_payments',
    'traffic_fine_audit_logs',
    'traffic_fine_imports',
    'traffic_fines',
    'variable_costs'
  ];

  // Test SELECT operations
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      results.push({
        table,
        operation: 'select',
        success: !error,
        error: error?.message
      });

      if (error) {
        console.error(`SELECT test failed for ${table}:`, error);
      }
    } catch (err: any) {
      results.push({
        table,
        operation: 'select',
        success: false,
        error: err.message
      });
    }
  }

  // Test INSERT operations
  for (const table of tablesToTest) {
    try {
      // Create a minimal test record
      const testRecord = {
        // Add required fields based on table schema
        name: 'Test Record',
        amount: 100,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from(table)
        .insert([testRecord])
        .select()
        .single();

      results.push({
        table,
        operation: 'insert',
        success: !error,
        error: error?.message
      });

      if (error) {
        console.error(`INSERT test failed for ${table}:`, error);
      }
    } catch (err: any) {
      results.push({
        table,
        operation: 'insert',
        success: false,
        error: err.message
      });
    }
  }

  // Test UPDATE operations
  for (const table of tablesToTest) {
    try {
      const { error } = await supabase
        .from(table)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', 'test-id'); // Use a non-existent ID to avoid actual updates

      results.push({
        table,
        operation: 'update',
        success: !error,
        error: error?.message
      });

      if (error) {
        console.error(`UPDATE test failed for ${table}:`, error);
      }
    } catch (err: any) {
      results.push({
        table,
        operation: 'update',
        success: false,
        error: err.message
      });
    }
  }

  // Test DELETE operations
  for (const table of tablesToTest) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', 'test-id'); // Use a non-existent ID to avoid actual deletions

      results.push({
        table,
        operation: 'delete',
        success: !error,
        error: error?.message
      });

      if (error) {
        console.error(`DELETE test failed for ${table}:`, error);
      }
    } catch (err: any) {
      results.push({
        table,
        operation: 'delete',
        success: false,
        error: err.message
      });
    }
  }

  // Log summary
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.error('Failed RLS policy tests:', failedTests);
    toast.error(`${failedTests.length} RLS policy tests failed`, {
      description: 'Check console for details'
    });
  } else {
    console.log('All RLS policy tests passed successfully!');
    toast.success('All RLS policy tests passed!');
  }

  return results;
};