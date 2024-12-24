import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting recurring payments processing...')

    // Get all recurring payments due for processing
    const { data: duePayments, error: fetchError } = await supabase
      .from('payments')
      .select(`
        id,
        lease_id,
        amount,
        payment_method,
        next_payment_date,
        recurring_interval
      `)
      .eq('is_recurring', true)
      .lte('next_payment_date', new Date().toISOString())

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${duePayments?.length || 0} payments to process`)

    const results = []
    for (const payment of duePayments || []) {
      try {
        // Create new payment record
        const { data: newPayment, error: insertError } = await supabase
          .from('payments')
          .insert({
            lease_id: payment.lease_id,
            amount: payment.amount,
            payment_method: payment.payment_method,
            status: 'pending',
            payment_date: new Date().toISOString(),
            is_recurring: true,
            recurring_interval: payment.recurring_interval,
            next_payment_date: new Date(
              new Date(payment.next_payment_date).getTime() + 
              getIntervalMilliseconds(payment.recurring_interval)
            ).toISOString()
          })
          .select()
          .single()

        if (insertError) throw insertError

        // Update original payment's next payment date
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            next_payment_date: new Date(
              new Date(payment.next_payment_date).getTime() + 
              getIntervalMilliseconds(payment.recurring_interval)
            ).toISOString()
          })
          .eq('id', payment.id)

        if (updateError) throw updateError

        results.push({
          status: 'success',
          paymentId: payment.id,
          newPaymentId: newPayment.id
        })

        console.log(`Successfully processed payment ${payment.id}`)
      } catch (error) {
        console.error(`Error processing payment ${payment.id}:`, error)
        results.push({
          status: 'error',
          paymentId: payment.id,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in process-recurring-payments:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Helper function to convert interval string to milliseconds
function getIntervalMilliseconds(interval: string): number {
  const [value, unit] = interval.split(' ')
  const numValue = parseInt(value)
  
  switch (unit) {
    case 'days':
      return numValue * 24 * 60 * 60 * 1000
    case 'weeks':
      return numValue * 7 * 24 * 60 * 60 * 1000
    case 'months':
      return numValue * 30 * 24 * 60 * 60 * 1000 // Approximate
    default:
      throw new Error(`Unsupported interval unit: ${unit}`)
  }
}