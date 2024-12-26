import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/types/database/database.types";

interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  transaction_date: string;
  category_id?: string;
}

interface TransactionRow {
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
    
    // Transform the rows into the correct format expected by the database
    const transformedData: TransactionData[] = rows.map(row => ({
      type: 'expense', // Default to expense, adjust based on your needs
      amount: parseFloat(row.amount),
      description: row.description,
      transaction_date: row.transaction_date,
      // Map category to category_id if needed
      // category_id: getCategoryId(row.category)
    }));

    // Insert the transformed data
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