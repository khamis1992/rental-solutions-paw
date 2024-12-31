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
    console.log('Content-Type:', req.headers.get('content-type'))

    let requestData;
    const contentType = req.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      requestData = await req.json()
      console.log('Parsed JSON data:', requestData)
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData()
      requestData = Object.fromEntries(formData.entries())
      console.log('Parsed form data:', requestData)
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      requestData = Object.fromEntries(formData.entries())
      console.log('Parsed URL-encoded data:', requestData)
    } else {
      throw new Error(`Unsupported content type: ${contentType}`)
    }

    // Validate required fields
    if (!requestData.fileName || !requestData.fileContent) {
      console.error('Missing required fields:', { requestData })
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: fileName and fileContent are required',
          receivedData: requestData
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Processing file:', requestData.fileName)

    // Parse CSV content
    const lines = requestData.fileContent.split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
    
    const headers = lines[0].split(',').map((h: string) => h.trim())
    
    console.log('File headers:', headers)
    console.log('Total lines:', lines.length)

    // Process rows (skip header)
    const payments = []
    const errors = []
    let validRows = 0
    let totalAmount = 0

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim())
        const rowData: Record<string, string> = {}
        
        headers.forEach((header, index) => {
          rowData[header] = values[index]
        })

        // Validate amount
        const amount = parseFloat(rowData.Amount)
        if (isNaN(amount)) {
          errors.push(`Row ${i}: Invalid amount format`)
          continue
        }

        // Create payment object
        const payment = {
          amount: amount,
          description: rowData.Description,
          payment_date: new Date(rowData.Payment_Date).toISOString(),
          status: 'completed',
          type: 'Income',
          amount_paid: amount,
          balance: 0,
          lease_id: rowData.Lease_ID || null
        }

        payments.push(payment)
        validRows++
        totalAmount += amount
      } catch (error) {
        console.error(`Error processing row ${i}:`, error)
        errors.push(`Row ${i}: ${error.message}`)
      }
    }

    console.log(`Processing ${payments.length} payments`)

    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('import_logs')
      .insert({
        file_name: requestData.fileName,
        status: 'pending',
        records_processed: validRows,
        errors: errors.length > 0 ? errors : null
      })
      .select()
      .single()

    if (importError) {
      console.error('Error creating import record:', importError)
      throw importError
    }

    // Insert payments in batches of 100
    const batchSize = 100
    const insertErrors = []

    for (let i = 0; i < payments.length; i += batchSize) {
      const batch = payments.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('payments')
        .insert(batch)

      if (insertError) {
        console.error('Batch insert error:', insertError)
        insertErrors.push(insertError.message)
      }
    }

    // Update import record status
    const finalStatus = insertErrors.length > 0 ? 'completed_with_errors' : 'completed'
    await supabase
      .from('import_logs')
      .update({ 
        status: finalStatus,
        errors: insertErrors.length > 0 ? insertErrors : null
      })
      .eq('id', importRecord.id)

    console.log('Import processing completed')

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: payments.length,
        validRows,
        invalidRows: errors.length,
        totalAmount,
        errors: errors.length > 0 ? errors : undefined,
        suggestions: errors.length > 0 ? [
          'Please review and correct the errors before proceeding',
          'Ensure all amounts are valid numbers',
          'Verify date formats are correct'
        ] : []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error processing import:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})