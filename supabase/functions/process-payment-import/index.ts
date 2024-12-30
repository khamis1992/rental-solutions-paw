import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    console.log('Starting payment import processing...')
    const formData = await req.formData()
    const file = formData.get('file')
    const fileName = formData.get('fileName')

    if (!file || !fileName) {
      throw new Error('Missing required fields')
    }

    console.log('Processing file:', fileName)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process the file content
    const fileContent = await file.text()
    console.log('File content received, processing...')

    // Parse CSV content
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    const rows = lines.slice(1)

    // Validate required fields
    const requiredFields = ['amount', 'payment_date', 'payment_method', 'lease_id']
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    // Process each row
    let successCount = 0
    let errorCount = 0
    const errors = []
    const batchSize = 50
    const payments = []

    for (let i = 0; i < rows.length; i++) {
      try {
        const values = rows[i].split(',').map(v => v.trim())
        const payment = {
          lease_id: values[headers.indexOf('lease_id')],
          amount: parseFloat(values[headers.indexOf('amount')]),
          payment_date: values[headers.indexOf('payment_date')],
          payment_method: values[headers.indexOf('payment_method')],
          status: 'completed',
          transaction_id: values[headers.indexOf('transaction_id')] || null,
        }

        // Validate payment data
        if (!payment.lease_id || isNaN(payment.amount) || !payment.payment_date) {
          throw new Error('Invalid payment data')
        }

        payments.push(payment)

        // Process in batches
        if (payments.length === batchSize || i === rows.length - 1) {
          const { error: insertError } = await supabaseClient
            .from('payments')
            .insert(payments)

          if (insertError) {
            errorCount += payments.length
            errors.push({
              rows: `${i - payments.length + 1} to ${i}`,
              error: insertError.message
            })
          } else {
            successCount += payments.length
          }

          payments.length = 0 // Clear the batch
        }

      } catch (error) {
        errorCount++
        errors.push({
          row: i + 1,
          error: error.message
        })
      }
    }

    // Update import log
    await supabaseClient
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: successCount + errorCount,
        errors: errors.length > 0 ? errors : null
      })
      .eq('file_name', fileName)

    const result = {
      success: true,
      message: `Successfully processed ${successCount} payments with ${errorCount} errors`,
      processed: successCount,
      errors: errorCount,
      errorDetails: errors
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing payment import:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during processing',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})
