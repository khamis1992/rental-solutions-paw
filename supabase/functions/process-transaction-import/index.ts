import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Parse and validate request body
    const { fileName } = await req.json()
    console.log('Processing file:', fileName)

    if (!fileName) {
      throw new Error('fileName is required')
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('imports')
      .download(fileName)

    if (downloadError) {
      console.error('Error downloading file:', downloadError)
      throw downloadError
    }

    // Parse CSV content
    const text = await fileData.text()
    const rows = text.split('\n').slice(1) // Skip header row
    
    // Process each row into a transaction
    const transactions = rows
      .filter(row => row.trim()) // Skip empty rows
      .map(row => {
        const [date, amount, description, agreement_number] = row.split(',')
        return {
          type: 'INCOME',
          amount: parseFloat(amount),
          description: description?.trim(),
          transaction_date: new Date(date).toISOString(),
          reference_type: 'import',
          status: 'completed',
          metadata: {
            agreement_number: agreement_number?.trim(),
          }
        }
      })
      .filter(t => !isNaN(t.amount) && t.amount > 0) // Validate amounts

    console.log('Processed transactions:', transactions.length)

    // Save to accounting_transactions
    const { error: transactionError } = await supabaseClient
      .from('accounting_transactions')
      .insert(transactions)

    if (transactionError) {
      console.error('Error saving transactions:', transactionError)
      throw transactionError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: transactions.length,
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