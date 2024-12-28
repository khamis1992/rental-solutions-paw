import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Transaction {
  transaction_date: string;
  amount: number;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
  reference_type?: string;
  reference_id?: string;
  metadata?: Record<string, unknown>;
}

const validateDate = (dateStr: string): boolean => {
  try {
    const timestamp = Date.parse(dateStr);
    return !isNaN(timestamp);
  } catch (error) {
    console.error(`Date validation error for ${dateStr}:`, error);
    return false;
  }
}

const formatDateToISO = (dateStr: string): string | null => {
  try {
    if (!validateDate(dateStr)) {
      console.error('Invalid date value:', dateStr);
      return null;
    }
    return new Date(dateStr).toISOString();
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
}

const validateTransaction = (transaction: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!transaction.transaction_date) {
    errors.push('Missing transaction_date');
  } else if (!validateDate(transaction.transaction_date)) {
    errors.push(`Invalid transaction_date: ${transaction.transaction_date}`);
  }

  if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
    errors.push(`Invalid amount: ${transaction.amount}`);
  }

  if (!transaction.type || !['INCOME', 'EXPENSE'].includes(transaction.type)) {
    errors.push(`Invalid transaction type: ${transaction.type}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting transaction import process...');
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fileName, transactions } = await req.json();
    console.log('Request payload:', { fileName, transactionCount: transactions?.length });

    if (!transactions && !fileName) {
      throw new Error('Either fileName or transactions array is required');
    }

    let processedTransactions: Transaction[] = [];

    if (fileName) {
      console.log('Processing file:', fileName);
      const { data: fileData, error: downloadError } = await supabaseClient
        .storage
        .from('imports')
        .download(fileName);

      if (downloadError) {
        console.error('File download error:', downloadError);
        throw downloadError;
      }

      const text = await fileData.text();
      const rows = text.split('\n').slice(1); // Skip header row
      
      console.log(`Processing ${rows.length} rows from CSV`);
      
      processedTransactions = rows
        .filter(row => row.trim())
        .map((row, index) => {
          try {
            const [date, amount, description, type] = row.split(',').map(val => val.trim());
            const formattedDate = formatDateToISO(date);
            
            if (!formattedDate) {
              console.error(`Invalid date in row ${index + 1}:`, date);
              return null;
            }

            const transaction = {
              transaction_date: formattedDate,
              amount: parseFloat(amount),
              description: description?.trim(),
              type: type?.toUpperCase() as 'INCOME' | 'EXPENSE',
              reference_type: 'import',
              metadata: { source: 'csv_import', row_number: index + 1 }
            };

            const validation = validateTransaction(transaction);
            if (!validation.isValid) {
              console.error(`Validation failed for row ${index + 1}:`, validation.errors);
              return null;
            }

            return transaction;
          } catch (error) {
            console.error(`Error processing row ${index + 1}:`, error);
            return null;
          }
        })
        .filter((t): t is Transaction => t !== null);

    } else if (Array.isArray(transactions)) {
      console.log('Processing transactions array');
      
      processedTransactions = transactions
        .map((t, index) => {
          try {
            const formattedDate = formatDateToISO(t.transaction_date);
            if (!formattedDate) return null;

            const transaction = {
              ...t,
              transaction_date: formattedDate,
              metadata: { 
                ...t.metadata,
                processed_at: new Date().toISOString(),
                source: 'direct_import'
              }
            };

            const validation = validateTransaction(transaction);
            if (!validation.isValid) {
              console.error(`Validation failed for transaction ${index}:`, validation.errors);
              return null;
            }

            return transaction;
          } catch (error) {
            console.error(`Error processing transaction ${index}:`, error);
            return null;
          }
        })
        .filter((t): t is Transaction => t !== null);
    }

    console.log(`Processed ${processedTransactions.length} valid transactions`);

    if (processedTransactions.length === 0) {
      throw new Error('No valid transactions found to process');
    }

    // Save to accounting_transactions
    const { error: transactionError } = await supabaseClient
      .from('accounting_transactions')
      .insert(processedTransactions.map(t => ({
        ...t,
        status: 'completed',
      })));

    if (transactionError) {
      console.error('Database insertion error:', transactionError);
      throw transactionError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: processedTransactions.length,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Transaction processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});