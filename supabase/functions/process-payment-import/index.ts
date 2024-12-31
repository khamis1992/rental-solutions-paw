import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    console.log('Starting payment processing...')
    const requestData = await req.json()
    console.log('Request payload:', requestData)

    // Validate required fields
    if (!requestData.lease_id || !requestData.amount) {
      console.error('Missing required fields in request')
      throw new Error('Missing required fields: lease_id and amount are required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create payment record
    const { data: paymentData, error: paymentError } = await supabaseClient
      .from('payments')
      .insert([{
        lease_id: requestData.lease_id,
        amount: requestData.amount,
        payment_date: requestData.payment_date || new Date().toISOString(),
        status: 'completed',
        payment_method: requestData.payment_method,
        description: requestData.description,
        type: 'Income',
        amount_paid: requestData.amount,
        balance: 0
      }])
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment:', paymentError)
      throw paymentError
    }

    console.log('Payment created successfully:', paymentData)

    // Create corresponding transaction record
    const { data: transactionData, error: transactionError } = await supabaseClient
      .from('accounting_transactions')
      .insert([{
        amount: requestData.amount,
        type: 'INCOME',
        description: requestData.description || 'Payment received',
        transaction_date: requestData.payment_date || new Date().toISOString(),
        reference_type: 'payment',
        reference_id: paymentData.id,
        meta_data: {
          lease_id: requestData.lease_id,
          payment_id: paymentData.id
        }
      }])
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      // Even if transaction creation fails, we don't throw since payment was successful
      // But we log it for monitoring
    } else {
      console.log('Transaction created successfully:', transactionData)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment: paymentData,
        transaction: transactionData
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in payment processing:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during payment processing',
        details: error.stack,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})