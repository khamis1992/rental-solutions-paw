import { supabase } from "@/integrations/supabase/client";
import { TransactionType } from "../../accounting/types/transaction.types";

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

const mapTransactionTypeToAmountType = (type: TransactionType): "income" | "expense" | "refund" => {
  // Map the new enum values to the transaction_amounts table types
  switch (type) {
    case "INCOME":
    case "RENTAL_FEE":
    case "LATE_PAYMENT_FEE":
    case "ADMINISTRATIVE_FEES":
    case "VEHICLE_DAMAGE_CHARGE":
    case "TRAFFIC_FINE":
    case "ADVANCE_PAYMENT":
      return "income";
    case "EXPENSE":
      return "expense";
    default:
      return "income"; // Default to income for other types
  }
};

export const saveTransactions = async (rows: TransactionRow[]) => {
  try {
    console.log('Starting transaction import process...', { rowCount: rows.length });
    
    // Process transactions with income type and validation
    const processedRows = rows.map(row => ({
      type: 'INCOME' as TransactionType,
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

    // Save to transaction_amounts with proper type mapping
    const transactionAmounts = processedRows.map(row => ({
      amount: row.amount,
      type: mapTransactionTypeToAmountType(row.type),
      recorded_date: row.transaction_date
    }));

    const { error: amountError } = await supabase
      .from('transaction_amounts')
      .insert(transactionAmounts);

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