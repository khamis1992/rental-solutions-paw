import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { paymentId } = await req.json()
    
    if (!paymentId) {
      throw new Error('Payment ID is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (paymentError) throw paymentError

    // Create reconciliation record
    const { data: reconciliation, error: reconciliationError } = await supabase
      .from('payment_reconciliation')
      .insert({
        payment_id: paymentId,
        lease_id: payment.lease_id,
        reconciliation_status: 'completed',
        match_confidence: 1.0,
        auto_matched: true
      })
      .select()
      .single()

    if (reconciliationError) throw reconciliationError

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', paymentId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, data: reconciliation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})