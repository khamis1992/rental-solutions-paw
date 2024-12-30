import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/types/database/database.types";

export interface TransactionRow {
  transaction_date: string;
  amount: string;
  description: string;
  category: string;
  payment_method: string;
  reference_number: string;
  status: string;
  notes: string;
  tags: string;
}

export const saveTransactions = async (rows: TransactionRow[]) => {
  try {
    console.log('Starting transaction import process...', { rowCount: rows.length });
    
    const { data, error } = await supabase.functions.invoke('process-transaction-import', {
      body: { rows }
    });

    if (error) {
      console.error('Transaction import error:', error);
      throw error;
    }

    console.log('Transaction import completed:', data);
    return data;
    
  } catch (error) {
    console.error('Save transaction error:', error);
    throw error;
  }
};