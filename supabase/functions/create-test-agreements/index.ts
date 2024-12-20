import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting test agreements creation...')

    // Get test vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('is_test_data', true)
      .limit(5)

    if (vehiclesError) throw vehiclesError

    // Get test customers
    const { data: customers, error: customersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_ai_generated', true)
      .limit(5)

    if (customersError) throw customersError

    if (!vehicles?.length || !customers?.length) {
      throw new Error('No test vehicles or customers found')
    }

    // Create test agreements
    const agreements = []
    for (let i = 0; i < Math.min(vehicles.length, customers.length); i++) {
      agreements.push({
        vehicle_id: vehicles[i].id,
        customer_id: customers[i].id,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        initial_mileage: 1000 * (i + 1),
        total_amount: 1000 * (i + 1),
        agreement_type: i % 2 === 0 ? 'lease_to_own' : 'short_term',
        monthly_payment: 500,
        agreement_number: `TEST-AGR-${i + 1}`,
        rent_amount: 500
      })
    }

    const { data: createdAgreements, error: agreementsError } = await supabase
      .from('leases')
      .insert(agreements)
      .select()

    if (agreementsError) throw agreementsError

    console.log('Test agreements created successfully:', createdAgreements)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test agreements created successfully',
        data: createdAgreements
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in create-test-agreements function:', error)
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