import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PaymentAnalysis {
  agreement_id: string;
  amount: number;
  payment_date: string;
  late_fine: number;
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get raw payment data
    const { data: rawPayments, error: fetchError } = await supabase
      .from('raw_payment_imports')
      .select('*')
      .eq('is_valid', true)
      .is('error_description', null)

    if (fetchError) throw fetchError

    // Prepare data for ChatGPT analysis
    const paymentsData = rawPayments.map(p => ({
      agreement_number: p.Agreemgent_Number,
      amount: p.Amount,
      payment_date: p.Payment_Date,
      description: p.Description
    }))

    // Call ChatGPT API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: `You are a payment processing assistant. Analyze payment data and return a JSON array of payment objects. 
          For each payment:
          1. Verify the payment details
          2. Calculate late fees (120 QAR per day) for payments after the 1st of the month
          3. Format the response as an array of objects with: agreement_id, amount, payment_date, late_fine, description`
        }, {
          role: "user",
          content: `Analyze these payments: ${JSON.stringify(paymentsData)}`
        }]
      })
    })

    const aiResponse = await response.json()
    const analysis = JSON.parse(aiResponse.choices[0].message.content) as PaymentAnalysis[]

    // Process each analyzed payment
    for (const payment of analysis) {
      // Insert into payments table
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          lease_id: payment.agreement_id,
          amount: payment.amount,
          payment_date: payment.payment_date,
          description: payment.description,
          type: 'INCOME',
          status: 'completed',
          late_fine_amount: payment.late_fine
        })

      if (paymentError) throw paymentError

      // Insert into accounting_transactions
      const { error: transactionError } = await supabase
        .from('accounting_transactions')
        .insert({
          type: 'INCOME',
          amount: payment.amount,
          description: payment.description,
          transaction_date: payment.payment_date
        })

      if (transactionError) throw transactionError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: analysis.length,
        details: analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing payments:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})