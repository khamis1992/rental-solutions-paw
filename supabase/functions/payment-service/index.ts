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
  // Handle CORS preflight requests
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
    .select(`
      *,
      leases!inner (
        id,
        agreement_number,
        customer_id,
        profiles!inner (
          id,
          full_name,
          phone_number
        )
      )
    `)
    .single()

  if (paymentError) {
    console.error('Payment error:', paymentError)
    throw paymentError
  }

  return { success: true, payment }
}