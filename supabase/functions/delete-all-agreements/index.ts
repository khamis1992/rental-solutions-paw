import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting deletion of all agreements and related data...')

    // Delete records from dependent tables first
    await supabase.from('payment_history').delete().neq('id', '')
    await supabase.from('payment_schedules').delete().neq('id', '')
    await supabase.from('payments').delete().neq('id', '')
    await supabase.from('penalties').delete().neq('id', '')
    await supabase.from('applied_discounts').delete().neq('id', '')
    await supabase.from('security_deposits').delete().neq('id', '')
    await supabase.from('damages').delete().neq('id', '')
    
    // Finally, delete the agreements
    await supabase.from('leases').delete().neq('id', '')

    console.log('Successfully deleted all agreements and related data')

    return new Response(
      JSON.stringify({ message: 'All agreements and related data deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error deleting agreements:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})