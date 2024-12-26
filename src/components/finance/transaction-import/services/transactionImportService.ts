import { supabase } from "@/integrations/supabase/client";
import { ImportedTransaction } from "../types/transaction.types";
import { Json } from '@/integrations/supabase/types';

export const saveTransactionImport = async (rows: ImportedTransaction[]) => {
  try {
    // First save to raw_transaction_imports
    const { data: rawImports, error: rawError } = await supabase
      .from('raw_transaction_imports')
      .insert(
        rows.map(row => ({
          raw_data: row as unknown as Json,
          is_valid: true
        }))
      )
      .select();

    if (rawError) throw rawError;

    // Then save to transaction_amounts
    const { error: amountsError } = await supabase
      .from('transaction_amounts')
      .insert(
        rawImports.map(importRow => ({
          transaction_id: importRow.id,
          amount: Number((importRow.raw_data as unknown as ImportedTransaction).amount),
          type: 'income' as const,
          category: ((importRow.raw_data as unknown as ImportedTransaction).category || 'other'),
          recorded_date: (importRow.raw_data as unknown as ImportedTransaction).transaction_date
        }))
      );

    if (amountsError) throw amountsError;

    return { success: true, count: rows.length };
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
};

export const deleteAllTransactions = async () => {
  try {
    const { error } = await supabase.functions.invoke('delete-all-transactions');
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting transactions:', error);
    throw error;
  }
};