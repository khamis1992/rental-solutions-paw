import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')
    
    if (!supabaseUrl || !supabaseKey || !deepseekApiKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get raw payment data
    const { data: rawPayments, error: fetchError } = await supabase
      .from('raw_payment_imports')
      .select('*')
      .eq('is_valid', true)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    console.log('Processing raw payments:', rawPayments)

    for (const payment of rawPayments) {
      try {
        // Find matching agreement
        const { data: agreement } = await supabase
          .from('leases')
          .select('*')
          .eq('agreement_number', payment.Agreemgent_Number)
          .single()

        if (!agreement) {
          console.warn(`No agreement found for number: ${payment.Agreemgent_Number}`)
          continue
        }

        // Calculate late fine if payment is after 1st of the month
        const paymentDate = new Date(payment.Payment_Date)
        const lateFine = paymentDate.getDate() > 1 ? 
          (paymentDate.getDate() - 1) * 120 : 0 // 120 QAR per day late

        // Insert payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            lease_id: agreement.id,
            amount: payment.Amount,
            payment_date: payment.Payment_Date,
            payment_method: payment.Payment_Method,
            status: 'completed',
            description: payment.Description,
            transaction_id: payment.Transaction_ID,
            type: 'INCOME',
            late_fine_amount: lateFine,
            days_overdue: paymentDate.getDate() - 1
          })

        if (paymentError) throw paymentError

        // Insert accounting transaction
        const { error: transactionError } = await supabase
          .from('accounting_transactions')
          .insert({
            transaction_id: payment.Transaction_ID,
            agreement_number: payment.Agreemgent_Number,
            customer_name: payment.Customer_Name,
            license_plate: payment.License_Plate,
            amount: payment.Amount,
            payment_method: payment.Payment_Method,
            description: payment.Description,
            transaction_date: payment.Payment_Date,
            type: 'INCOME',
            status: 'completed'
          })

        if (transactionError) throw transactionError

        // Mark raw payment as processed
        await supabase
          .from('raw_payment_imports')
          .update({ is_valid: false })
          .eq('id', payment.id)

      } catch (error) {
        console.error('Error processing payment:', error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: rawPayments.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})