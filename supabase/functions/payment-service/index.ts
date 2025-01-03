import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  leaseId: string;
  amount: number;
  paymentMethod: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log service request
    await supabase.from('service_communication_logs').insert({
      source_service: 'client',
      target_service: 'payment_service',
      request_type: req.method,
    })

    const { operation, data } = await req.json()
    let result

    switch (operation) {
      case 'process_payment':
        result = await processPayment(supabase, data as PaymentRequest)
        break
      case 'reconcile_payment':
        result = await reconcilePayment(supabase, data.paymentId)
        break
      default:
        throw new Error('Invalid operation')
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Payment service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

async function processPayment(supabase: any, paymentData: PaymentRequest) {
  console.log('Processing payment:', paymentData)

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      lease_id: paymentData.leaseId,
      amount: paymentData.amount,
      payment_method: paymentData.paymentMethod,
      description: paymentData.description,
      status: 'completed',
      payment_date: new Date().toISOString(),
    })
    .select()
    .single()

  if (paymentError) throw paymentError

  return { success: true, payment }
}

async function reconcilePayment(supabase: any, paymentId: string) {
  console.log('Reconciling payment:', paymentId)

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (paymentError) throw paymentError

  const { error: reconciliationError } = await supabase
    .from('payment_reconciliation')
    .insert({
      payment_id: paymentId,
      lease_id: payment.lease_id,
      reconciliation_status: 'completed',
      match_confidence: 1.0,
      auto_matched: true
    })

  if (reconciliationError) throw reconciliationError

  return { success: true, message: 'Payment reconciled successfully' }
}