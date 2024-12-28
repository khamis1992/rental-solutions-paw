import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const isValidDate = (dateValue: string): boolean => {
  if (!dateValue) return false;
  const timestamp = Date.parse(dateValue);
  return !isNaN(timestamp);
};

const formatDateToISO = (dateValue: string): string | null => {
  try {
    if (!isValidDate(dateValue)) {
      console.error('Invalid date value:', dateValue);
      return null;
    }
    return new Date(dateValue).toISOString();
  } catch (error) {
    console.error('Error formatting date:', dateValue, error);
    return null;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { fileName, transactions } = await req.json()
    console.log('Processing request:', { fileName, transactionCount: transactions?.length })

    let processedTransactions = []

    if (fileName) {
      // Download and process file
      const { data: fileData, error: downloadError } = await supabaseClient
        .storage
        .from('imports')
        .download(fileName)

      if (downloadError) {
        console.error('Error downloading file:', downloadError)
        throw downloadError
      }

      const text = await fileData.text()
      const rows = text.split('\n').slice(1) // Skip header row
      
      processedTransactions = rows
        .filter(row => row.trim()) // Skip empty rows
        .map(row => {
          const [date, amount, description, agreement_number] = row.split(',')
          
          // Validate and format date
          const formattedDate = formatDateToISO(date);
          if (!formattedDate) {
            console.error('Invalid date in row:', { date, row });
            return null;
          }

          return {
            type: 'INCOME',
            amount: parseFloat(amount),
            description: description?.trim(),
            transaction_date: formattedDate,
            reference_type: 'import',
            status: 'completed',
            metadata: {
              agreement_number: agreement_number?.trim(),
            }
          }
        })
        .filter(t => t !== null && !isNaN(t.amount) && t.amount > 0)

    } else if (Array.isArray(transactions)) {
      // Process provided transactions array
      processedTransactions = transactions
        .map(t => {
          // Validate and format transaction date
          const formattedDate = formatDateToISO(t.transaction_date);
          if (!formattedDate) {
            console.error('Invalid transaction date:', t);
            return null;
          }
          return {
            ...t,
            transaction_date: formattedDate
          };
        })
        .filter(t => t !== null); // Remove transactions with invalid dates
    } else {
      throw new Error('Either fileName or transactions array is required')
    }

    console.log('Processed transactions:', processedTransactions.length)

    if (processedTransactions.length === 0) {
      throw new Error('No valid transactions found to process')
    }

    // Save to accounting_transactions
    const { error: transactionError } = await supabaseClient
      .from('accounting_transactions')
      .insert(processedTransactions)

    if (transactionError) {
      console.error('Error saving transactions:', transactionError)
      throw transactionError
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
    )

  } catch (error) {
    console.error('Error processing transactions:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})