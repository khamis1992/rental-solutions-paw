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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { agreementNumber, paymentDate } = await req.json()

    if (!agreementNumber || !paymentDate) {
      throw new Error('Agreement number and payment date are required')
    }

    // Query to get customer details and verify active contract
    const { data: agreement, error: agreementError } = await supabaseClient
      .from('leases')
      .select(`
        id,
        agreement_number,
        start_date,
        end_date,
        customer:customer_id (
          id,
          full_name
        )
      `)
      .eq('agreement_number', agreementNumber)
      .single()

    if (agreementError) throw agreementError
    if (!agreement) throw new Error('Agreement not found')

    const paymentDateObj = new Date(paymentDate)
    const startDate = new Date(agreement.start_date)
    const endDate = agreement.end_date ? new Date(agreement.end_date) : null

    // Verify if payment date falls within contract period
    const isValidDate = paymentDateObj >= startDate && 
      (!endDate || paymentDateObj <= endDate)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          customerId: agreement.customer?.id,
          customerName: agreement.customer?.full_name,
          isValidDate,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error verifying customer:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})