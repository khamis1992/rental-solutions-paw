import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { rows } = await req.json()
    console.log('Processing transactions:', rows.length)

    // Save raw import data
    const { error: rawDataError } = await supabaseClient
      .from('raw_transaction_imports')
      .insert(rows.map((row: any) => ({
        raw_data: row,
        is_valid: true
      })))

    if (rawDataError) {
      console.error('Error saving raw data:', rawDataError)
      throw rawDataError
    }

    // Process and save transactions
    const transactions = rows.map((row: any) => ({
      type: 'income',
      amount: row.amount,
      description: row.description,
      transaction_date: row.payment_date,
      status: 'completed',
      reference_type: 'import',
      metadata: {
        agreement_number: row.agreement_number,
        customer_name: row.customer_name,
        license_plate: row.license_plate,
        vehicle: row.vehicle,
        payment_method: row.payment_method,
        payment_number: row.payment_number
      }
    }))

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
        message: `Successfully processed ${rows.length} transactions`,
        data: rows 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing transactions:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})