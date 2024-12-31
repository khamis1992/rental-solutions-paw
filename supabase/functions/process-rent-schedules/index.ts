import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { startOfMonth, addMonths } from 'https://esm.sh/date-fns'

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

    console.log('Starting rent schedule processing...')

    // Get all active agreements
    const { data: activeAgreements, error: agreementsError } = await supabase
      .from('leases')
      .select('id, rent_amount, rent_due_day')
      .eq('status', 'active')

    if (agreementsError) throw agreementsError

    console.log(`Found ${activeAgreements?.length || 0} active agreements`)

    const nextMonth = startOfMonth(addMonths(new Date(), 1))

    for (const agreement of activeAgreements || []) {
      // Check if schedule already exists for next month
      const { data: existingSchedule } = await supabase
        .from('payment_schedules')
        .select('id')
        .eq('lease_id', agreement.id)
        .gte('due_date', nextMonth.toISOString())
        .lt('due_date', addMonths(nextMonth, 1).toISOString())
        .single()

      if (!existingSchedule) {
        // Create new schedule for next month
        const dueDate = new Date(nextMonth)
        dueDate.setDate(agreement.rent_due_day || 1)

        const { error: insertError } = await supabase
          .from('payment_schedules')
          .insert({
            lease_id: agreement.id,
            amount: agreement.rent_amount,
            due_date: dueDate.toISOString(),
            status: 'pending'
          })

        if (insertError) {
          console.error(`Error creating schedule for agreement ${agreement.id}:`, insertError)
          continue
        }

        console.log(`Created schedule for agreement ${agreement.id} due on ${dueDate}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Rent schedules processed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in process-rent-schedules:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})