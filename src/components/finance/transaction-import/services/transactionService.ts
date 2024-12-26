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
    console.log('Starting transaction save process...', { rowCount: rows.length });
    
    // First create an import log
    const { data: importLog, error: importLogError } = await supabase
      .from('transaction_imports')
      .insert({
        file_name: 'transaction_import_' + new Date().toISOString(),
        status: 'processing',
      })
      .select()
      .single();

    if (importLogError) {
      console.error('Error creating import log:', importLogError);
      throw importLogError;
    }
    
    console.log('Created import log:', importLog);

    // Save raw import data
    const rawImports = rows.map(row => ({
      import_id: importLog.id,
      raw_data: row as unknown as Json,
      is_valid: true
    }));

    const { error: rawImportError } = await supabase
      .from('raw_transaction_imports')
      .insert(rawImports);

    if (rawImportError) {
      console.error('Error saving raw imports:', rawImportError);
      throw rawImportError;
    }
    
    console.log('Saved raw transaction data');

    // Prepare transactions for insert into accounting_transactions
    const transactions = rows.map(row => ({
      type: 'expense',
      amount: parseFloat(row.amount) || 0,
      description: row.description,
      transaction_date: new Date(row.transaction_date).toISOString(),
      status: row.status || 'pending',
      reference_type: 'import',
      reference_id: importLog.id
    }));

    const { error: transactionError } = await supabase
      .from('accounting_transactions')
      .insert(transactions);

    if (transactionError) {
      console.error('Error inserting transactions:', transactionError);
      await supabase
        .from('transaction_imports')
        .update({ 
          status: 'error',
          errors: { message: transactionError.message }
        })
        .eq('id', importLog.id);
      throw transactionError;
    }

    // Update import log status to completed
    const { error: updateError } = await supabase
      .from('transaction_imports')
      .update({ 
        status: 'completed',
        records_processed: transactions.length
      })
      .eq('id', importLog.id);

    if (updateError) {
      console.error('Error updating import log status:', updateError);
      throw updateError;
    }

    console.log('Import process completed successfully');
  } catch (error) {
    console.error('Save transaction error:', error);
    throw error;
  }
};