import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

    // Get request body
    const { fileName } = await req.json()
    console.log('Processing file:', fileName)

    if (!fileName) {
      throw new Error('No file name provided')
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('imports')
      .download(fileName)

    if (downloadError) {
      throw downloadError
    }

    const text = await fileData.text()
    const lines = text.split('\n')
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())

    // Validate required headers
    const requiredHeaders = ['amount', 'payment_date', 'payment_method', 'status', 'lease_id']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

    if (missingHeaders.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing required headers',
          details: `Missing headers: ${missingHeaders.join(', ')}. The lease_id column is required.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const errors = []
    const processedRows = []

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(',').map(v => v.trim())
      const row = headers.reduce((obj: any, header, index) => {
        obj[header] = values[index]
        return obj
      }, {})

      try {
        // Validate lease_id
        if (!row.lease_id) {
          throw new Error(`Missing lease_id in row ${i}`)
        }

        // Verify lease exists
        const { data: leaseExists, error: leaseError } = await supabaseClient
          .from('leases')
          .select('id')
          .eq('id', row.lease_id)
          .single()

        if (leaseError || !leaseExists) {
          throw new Error(`Invalid lease_id in row ${i}: ${row.lease_id}`)
        }

        // Validate and parse date
        const paymentDate = new Date(row.payment_date)
        if (isNaN(paymentDate.getTime())) {
          throw new Error(`Invalid date format in row ${i}`)
        }

        // Validate amount
        const amount = parseFloat(row.amount)
        if (isNaN(amount)) {
          throw new Error(`Invalid amount in row ${i}`)
        }

        processedRows.push({
          amount,
          payment_date: paymentDate.toISOString(),
          payment_method: row.payment_method,
          status: row.status,
          description: row.description || null,
          transaction_id: row.transaction_id || null,
          lease_id: row.lease_id
        })
      } catch (error) {
        errors.push({
          row: i,
          error: error.message
        })
      }
    }

    // Insert valid rows
    if (processedRows.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('payments')
        .insert(processedRows)

      if (insertError) {
        throw insertError
      }
    }

    // Update import log
    await supabaseClient
      .from('import_logs')
      .update({
        status: errors.length === 0 ? 'completed' : 'completed_with_errors',
        records_processed: processedRows.length,
        errors: errors.length > 0 ? errors : null
      })
      .eq('file_name', fileName)

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedRows.length,
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing import:', error)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})