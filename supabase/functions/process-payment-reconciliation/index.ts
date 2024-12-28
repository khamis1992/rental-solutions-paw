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
    const { paymentId, agreementId } = await req.json()
    
    // Validate that at least one ID is provided
    if (!paymentId && !agreementId) {
      console.error('Validation Error: Neither Payment ID nor Agreement ID provided')
      throw new Error('Either Payment ID or Agreement ID must be provided for reconciliation')
    }

    console.log('Starting payment reconciliation:', { paymentId, agreementId })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (agreementId) {
      // Get all pending payments for the agreement
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('lease_id', agreementId)
        .eq('status', 'pending')

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
        throw paymentsError
      }

      if (!payments || payments.length === 0) {
        console.log('No pending payments found for agreement:', agreementId)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'No pending payments found for reconciliation',
            data: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Found ${payments.length} payments to reconcile for agreement:`, agreementId)

      // Process each payment
      const reconciliations = await Promise.all(payments.map(async (payment) => {
        const { data: reconciliation, error: reconciliationError } = await supabase
          .from('payment_reconciliation')
          .insert({
            payment_id: payment.id,
            lease_id: agreementId,
            reconciliation_status: 'completed',
            match_confidence: 1.0,
            auto_matched: true
          })
          .select()
          .single()

        if (reconciliationError) {
          console.error('Error creating reconciliation:', reconciliationError)
          throw reconciliationError
        }

        // Update payment status
        const { error: updateError } = await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('id', payment.id)

        if (updateError) {
          console.error('Error updating payment:', updateError)
          throw updateError
        }

        return reconciliation
      }))

      console.log('Successfully reconciled payments for agreement:', agreementId)

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: reconciliations 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (paymentId) {
      // Single payment reconciliation logic
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*, lease:leases(*)')
        .eq('id', paymentId)
        .single()

      if (paymentError) {
        console.error('Error fetching payment:', paymentError)
        throw paymentError
      }

      if (!payment) {
        throw new Error(`Payment not found with ID: ${paymentId}`)
      }

      console.log('Processing single payment:', payment)

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

      if (reconciliationError) {
        console.error('Error creating reconciliation:', reconciliationError)
        throw reconciliationError
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', paymentId)

      if (updateError) {
        console.error('Error updating payment:', updateError)
        throw updateError
      }

      console.log('Successfully reconciled payment:', paymentId)

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: reconciliation 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in payment reconciliation:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400 
      }
    )
  }
})