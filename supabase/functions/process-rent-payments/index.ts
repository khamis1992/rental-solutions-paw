import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting automatic rent payment processing...')

    // Get all active agreements
    const { data: activeAgreements, error: agreementsError } = await supabase
      .from('leases')
      .select(`
        id,
        rent_amount,
        customer_id,
        agreement_number,
        profiles (
          full_name,
          email
        )
      `)
      .eq('status', 'active')

    if (agreementsError) throw agreementsError

    console.log(`Found ${activeAgreements?.length || 0} active agreements`)

    const today = new Date()
    const isFirstOfMonth = today.getDate() === 1

    if (isFirstOfMonth && activeAgreements) {
      for (const agreement of activeAgreements) {
        try {
          // Create payment record
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              lease_id: agreement.id,
              amount: agreement.rent_amount,
              status: 'pending',
              payment_date: today.toISOString(),
              description: `Automatic rent payment for ${agreement.agreement_number}`,
              type: 'Income'
            })

          if (paymentError) throw paymentError

          // Create payment schedule record
          const { error: scheduleError } = await supabase
            .from('payment_schedules')
            .insert({
              lease_id: agreement.id,
              amount: agreement.rent_amount,
              due_date: today.toISOString(),
              status: 'pending'
            })

          if (scheduleError) throw scheduleError

          console.log(`Created payment records for agreement ${agreement.agreement_number}`)
        } catch (error) {
          console.error(`Error processing payment for agreement ${agreement.id}:`, error)
        }
      }
    }

    // Get customers without active agreements
    const { data: customersWithoutAgreements, error: customersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .not('id', 'in', (activeAgreements || []).map(a => a.customer_id).filter(Boolean))

    if (customersError) throw customersError

    if (customersWithoutAgreements?.length) {
      console.log(`Found ${customersWithoutAgreements.length} customers without active agreements`)
      
      // Here you would typically integrate with your notification system
      // For now, we'll just log it
      for (const customer of customersWithoutAgreements) {
        console.log(`Customer ${customer.full_name} has no active agreements`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: activeAgreements?.length || 0,
        customersWithoutAgreements: customersWithoutAgreements?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in process-rent-payments:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})