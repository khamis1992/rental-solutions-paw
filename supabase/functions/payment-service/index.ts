import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from './corsHeaders.ts'
import { DatabaseOperations } from './dbOperations.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const dbOps = new DatabaseOperations(supabaseUrl, supabaseKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { operation, data } = await req.json()
    console.log('Received request:', { operation, data })

    let result
    switch (operation) {
      case 'process_payment':
        // Verify lease exists and get customer details
        const lease = await dbOps.verifyLease(data.leaseId)
        console.log('Lease verification result:', lease)

        if (!lease) {
          throw new Error('Failed to verify lease')
        }

        // Create payment
        result = await dbOps.createPayment({
          leaseId: data.leaseId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          description: data.description || '',
          type: data.type
        })
        break

      case 'reconcile_payment':
        // Add reconciliation logic here if needed
        break

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing request:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.details || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
