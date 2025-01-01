import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('Starting payment import processing...')
    
    // Parse the request body as JSON instead of form data
    const { analysisResult } = await req.json()
    
    if (!analysisResult) {
      throw new Error('Missing analysis result')
    }

    console.log('Processing analysis result:', analysisResult)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process the validated data
    const { validRows, totalAmount } = analysisResult
    
    if (!validRows || validRows.length === 0) {
      throw new Error('No valid rows to process')
    }

    console.log(`Processing ${validRows.length} valid payments...`)

    // Insert payments in batches
    const batchSize = 50
    const errors = []
    let successCount = 0

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, Math.min(i + batchSize, validRows.length))
      
      try {
        const { error: insertError } = await supabaseClient
          .from('payments')
          .insert(batch.map(row => ({
            amount: parseFloat(row.amount),
            payment_date: row.payment_date,
            payment_method: row.payment_method,
            status: 'completed',
            description: row.description,
            transaction_id: row.transaction_id,
            lease_id: row.lease_id
          })))

        if (insertError) {
          console.error('Batch insert error:', insertError)
          errors.push({
            rows: `${i + 1} to ${i + batch.length}`,
            error: insertError.message
          })
        } else {
          successCount += batch.length
        }
      } catch (error) {
        console.error(`Error processing batch ${i + 1}-${i + batch.length}:`, error)
        errors.push({
          rows: `${i + 1} to ${i + batch.length}`,
          error: error.message
        })
      }
    }

    const result = {
      success: true,
      message: `Successfully processed ${successCount} payments with ${errors.length} errors`,
      processed: successCount,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('Import processing completed:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error processing payment import:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred during processing'
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