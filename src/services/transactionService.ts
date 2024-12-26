import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/types/database/database.types";

// Interface for the raw transaction data from CSV
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

// Interface matching the database requirements
interface DatabaseTransaction {
  amount: number;
  transaction_date: string;
  type: 'income' | 'expense';
  category_id?: string;
  description?: string;
  cost_type?: string;
  is_recurring?: boolean;
  receipt_url?: string;
  recurrence_interval?: unknown;
  recurring_schedule?: Json;
  reference_type?: string;
  reference_id?: string;
  status?: string;
}

export const saveTransactions = async (rows: TransactionRow[]) => {
  try {
    console.log('Starting transaction import process...', { rowCount: rows.length });
    
    // Transform the rows into the format expected by the database
    const transformedData: DatabaseTransaction[] = rows.map(row => ({
      amount: parseFloat(row.amount),
      transaction_date: row.transaction_date,
      type: 'expense', // Default to expense, can be modified based on business logic
      description: row.description,
      status: row.status || 'completed',
      // Add any additional transformations needed
    }));

    console.log('Transformed data:', transformedData);

    const { data, error } = await supabase
      .from('accounting_transactions')
      .insert(transformedData);

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