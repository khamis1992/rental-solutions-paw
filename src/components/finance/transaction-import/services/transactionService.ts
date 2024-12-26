import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface TransactionRow {
  transaction_date: string;
  amount: string;
  description: string;
}

export const saveTransactions = async (validRows: TransactionRow[]) => {
  // Prepare transactions for insert
  const transactions = validRows.map(row => {
    // Handle the date more safely - assume it's already in YYYY-MM-DD format from CSV
    const dateStr = row.transaction_date.trim();
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day); // month is 0-based in JS Date

    return {
      transaction_date: format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      amount: parseFloat(row.amount),
      description: row.description,
      type: parseFloat(row.amount) >= 0 ? 'income' : 'expense',
      status: 'pending'
    };
  });

  // Insert transactions
  const { error: transactionError } = await supabase
    .from('accounting_transactions')
    .insert(transactions);

  if (transactionError) throw transactionError;
};