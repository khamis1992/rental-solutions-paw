import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting traffic fine import process');
    const { fileName } = await req.json()
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
    const lines = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (lines.length < 2) {
      throw new Error('File is empty or contains only headers')
    }

    // Validate headers
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    const requiredHeaders = [
      'serial_number',
      'violation_number',
      'violation_date',
      'license_plate',
      'fine_location',
      'violation_charge',
      'fine_amount',
      'violation_points'
    ]

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
    }

    // Process rows
    const fines = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim())
        
        if (values.length !== headers.length) {
          throw new Error(`Row ${i + 1} has incorrect number of columns`)
        }

        const rowData = headers.reduce((obj, header, index) => {
          obj[header] = values[index]
          return obj
        }, {} as Record<string, string>)

        // Validate date format
        const date = new Date(rowData.violation_date)
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format in row ${i + 1}`)
        }

        // Validate numeric values
        const amount = parseFloat(rowData.fine_amount)
        const points = parseInt(rowData.violation_points)
        
        if (isNaN(amount)) {
          throw new Error(`Invalid amount in row ${i + 1}`)
        }
        if (isNaN(points)) {
          throw new Error(`Invalid points in row ${i + 1}`)
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
          assignment_status: 'pending'
        })
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error)
        errors.push({
          row: i + 1,
          error: error.message,
          data: lines[i]
        })
      }
    }

    if (fines.length === 0) {
      throw new Error('No valid records found to import')
    }

    // Insert fines into database
    const { error: insertError } = await supabase
      .from('traffic_fines')
      .insert(fines)

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    // Log import results
    const { error: logError } = await supabase
      .from('traffic_fine_imports')
      .insert({
        file_name: fileName,
        total_fines: fines.length,
        unassigned_fines: fines.length,
        import_errors: errors.length > 0 ? errors : null
      })

    if (logError) {
      console.error('Error logging import:', logError)
    }

    console.log('Import completed successfully:', fines.length, 'fines processed')

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: fines.length,
        errors: errors.length > 0 ? errors : null 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Processing error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})