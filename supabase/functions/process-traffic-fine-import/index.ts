import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { validateRow, normalizeRow, validateHeaders } from './validators.ts'
import { processCSVContent, insertTrafficFines } from './dataProcessor.ts'

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
    const { fileName } = await req.json()
    if (!fileName) {
      throw new Error('No file name provided')
    }
    console.log('Processing file:', fileName)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Download file content
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName)

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    const content = await fileData.text()
    console.log('File content loaded')

    // Process CSV content
    const { headers, rows } = processCSVContent(content, 8)
    console.log('Headers:', headers)

    // Validate headers
    const missingHeaders = validateHeaders(headers)
    if (missingHeaders) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Missing required columns: ${missingHeaders.join(', ')}`
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process rows with validation and normalization
    const fines = []
    const errors = []

    for (let i = 0; i < rows.length; i++) {
      try {
        const rowIndex = i + 1
        console.log(`Processing row ${rowIndex}:`, rows[i])

        // Validate row
        const validationError = validateRow(rows[i], rowIndex, headers.length)
        if (validationError) {
          errors.push(validationError)
          // Continue processing other rows even if this one has an error
          continue
        }

        // Normalize row if needed
        const normalizedRow = normalizeRow(rows[i], headers.length)
        
        // Create fine object from normalized row
        const rowData = headers.reduce((obj, header, index) => {
          obj[header] = normalizedRow[index]
          return obj
        }, {} as Record<string, string>)

        // Validate required fields and data types
        const date = new Date(rowData.violation_date)
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format. Expected YYYY-MM-DD, got: ${rowData.violation_date}`)
        }

        const amount = parseFloat(rowData.fine_amount)
        if (isNaN(amount)) {
          throw new Error(`Invalid amount: ${rowData.fine_amount}`)
        }

        const points = parseInt(rowData.violation_points)
        if (isNaN(points)) {
          throw new Error(`Invalid points: ${rowData.violation_points}`)
        }

        fines.push({
          serial_number: rowData.serial_number,
          violation_number: rowData.violation_number,
          violation_date: date.toISOString(),
          license_plate: rowData.license_plate,
          fine_location: rowData.fine_location,
          violation_charge: rowData.violation_charge,
          fine_amount: amount,
          violation_points: points,
          payment_status: 'pending',
          assignment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        
        console.log('Successfully processed row:', rowData)
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error)
        errors.push({
          row: i + 1,
          error: error.message,
          data: rows[i].join(',')
        })
      }
    }

    console.log(`Processed ${rows.length} rows:`)
    console.log(`- Valid records: ${fines.length}`)
    console.log(`- Errors: ${errors.length}`)

    // Process the data and handle response
    const result = await insertTrafficFines(supabase, fines, errors)
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Processing error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})