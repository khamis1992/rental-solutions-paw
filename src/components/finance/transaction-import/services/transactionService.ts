import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/types/database/database.types";

export interface TransactionRow {
  transaction_date: string;
  amount: string;
  description: string;
  agreement_number: string;
  payment_method: string;
  reference_number: string;
  status: string;
  notes: string;
}

export const saveTransactions = async (rows: TransactionRow[]) => {
  try {
    console.log('Starting transaction import process...', { rowCount: rows.length });
    
    // Process transactions with income type and validation
    const processedRows = rows.map(row => ({
      type: 'income', // Always set as income
      amount: parseFloat(row.amount),
      description: row.description,
      transaction_date: new Date(row.transaction_date).toISOString(),
      reference_type: 'import',
      status: 'completed',
      metadata: {
        agreement_number: row.agreement_number,
        payment_method: row.payment_method,
        reference_number: row.reference_number,
        notes: row.notes
      }
    }));

    // Save to accounting_transactions
    const { data, error } = await supabase.functions.invoke('process-transaction-import', {
      body: { transactions: processedRows }
    });

    if (error) {
      console.error('Transaction import error:', error);
      throw error;
    }

    // Save to transaction_amounts for financial metrics
    const { error: amountError } = await supabase
      .from('transaction_amounts')
      .insert(processedRows.map(row => ({
        amount: row.amount,
        type: 'income',
        recorded_date: row.transaction_date
      })));

    if (amountError) {
      console.error('Error saving transaction amounts:', amountError);
      throw amountError;
    }

    console.log('Transaction import completed:', data);
    return data;
    
  } catch (error) {
    console.error('Save transaction error:', error);
    throw error;
  }
};