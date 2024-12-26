import { supabase } from "@/integrations/supabase/client";

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

export const saveTransactions = async (validRows: TransactionRow[]) => {
  try {
    console.log('Starting transaction save process...');
    
    // First create an import log
    const { data: importLog, error: importLogError } = await supabase
      .from('transaction_imports')
      .insert({
        file_name: 'transaction_import_' + new Date().toISOString(),
        status: 'processing',
      })
      .select()
      .single();

    if (importLogError) throw importLogError;
    
    console.log('Created import log:', importLog);

    // Process each row and store in raw_transaction_imports
    const rawImports = validRows.map(row => ({
      import_id: importLog.id,
      raw_data: row,
      is_valid: true // We'll validate this later
    }));

    const { error: rawImportError } = await supabase
      .from('raw_transaction_imports')
      .insert(rawImports);

    if (rawImportError) throw rawImportError;
    
    console.log('Saved raw transaction data');

    // Prepare transactions for insert into accounting_transactions
    const transactions = validRows.map(row => ({
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
      // Update import log with error status
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
    await supabase
      .from('transaction_imports')
      .update({ 
        status: 'completed',
        records_processed: transactions.length
      })
      .eq('id', importLog.id);

    console.log('Import process completed successfully');
  } catch (error) {
    console.error('Save transaction error:', error);
    throw error;
  }
};