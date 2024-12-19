import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface InstallmentRow {
  'N°cheque': string;
  'Amount': string;
  'Date': string;
  'Drawee Bank': string;
  'sold': string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filePath, contractName } = await req.json()
    console.log('Processing file:', filePath, 'for contract:', contractName)

    if (!filePath || !contractName) {
      throw new Error('File path and contract name are required')
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the file
    console.log('Downloading file from storage...')
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('imports')
      .download(filePath)

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw downloadError
    }

    // Parse CSV content
    const text = await fileData.text()
    const rows = text.split('\n')
    const headers = rows[0].split(',').map(h => h.trim())
    console.log('File headers:', headers)

    // Process each row
    const processedRows = []
    const errors = []

    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue // Skip empty rows

      const values = rows[i].split(',').map(v => v.trim())
      const row = headers.reduce((obj: any, header, index) => {
        obj[header] = values[index]
        return obj
      }, {}) as InstallmentRow

      try {
        // Parse amount - remove 'QAR' and convert to number
        const amount = parseFloat(row['Amount'].replace('QAR', '').replace(/,/g, '').trim())
        if (isNaN(amount)) {
          throw new Error(`Invalid amount in row ${i}`)
        }
        
        // Parse date - convert from DD/MM/YY format to ISO date
        const [day, month, year] = row['Date'].split('/')
        const date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day))
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format in row ${i}`)
        }

        processedRows.push({
          amount: amount,
          due_date: date.toISOString(),
          status: 'pending',
          contract_name: contractName,
          metadata: {
            cheque_number: row['N°cheque'],
            drawee_bank: row['Drawee Bank'],
            original_amount: row['Amount'],
            sold: row['sold']
          }
        })
      } catch (error) {
        console.error(`Error processing row ${i}:`, error)
        errors.push({
          row: i,
          error: error.message,
          data: row
        })
      }
    }

    console.log(`Processed ${processedRows.length} rows with ${errors.length} errors`)

    // Insert processed rows into payment_schedules table
    if (processedRows.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('payment_schedules')
        .insert(processedRows)

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }
    }

    // Delete the uploaded file
    const { error: deleteError } = await supabaseAdmin
      .storage
      .from('imports')
      .remove([filePath])

    if (deleteError) {
      console.error('Error deleting file:', deleteError)
      // Don't throw here, just log the error
    }

    return new Response(
      JSON.stringify({
        message: 'Import completed successfully',
        processed: processedRows.length,
        errors: errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing import:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})