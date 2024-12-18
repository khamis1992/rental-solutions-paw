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
    console.log('Starting deletion process...')

    // Delete records from dependent tables first in sequence
    const tables = [
      'payment_history',
      'payment_schedules',
      'payments',
      'penalties',
      'applied_discounts',
      'security_deposits',
      'damages',
      'leases'
    ]

    for (const table of tables) {
      console.log(`Deleting records from ${table}...`)
      const { error } = await supabase.from(table).delete().neq('id', '')
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error)
        throw error
      }
      
      console.log(`Successfully deleted records from ${table}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'All agreements and related data deleted successfully' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in delete-all-agreements function:', error)
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