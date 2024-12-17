import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    console.log('Processing vehicle import file:', fileName)

    if (!fileName) {
      return new Response(
        JSON.stringify({ success: false, error: 'fileName is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the file from storage
    console.log('Downloading file from storage...')
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('imports')
      .download(fileName)

    if (downloadError) {
      console.error('Failed to download file:', downloadError)
      return new Response(
        JSON.stringify({ success: false, error: `Failed to download file: ${downloadError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Convert the file to text and parse CSV
    const text = await fileData.text()
    const rows = text.split('\n')
    const headers = rows[0].toLowerCase().split(',').map(h => h.trim())
    console.log('CSV Headers:', headers)

    // Validate required fields
    const requiredFields = ['make', 'model', 'year', 'license_plate', 'vin']
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const errors: string[] = []
    let successCount = 0

    // Process each row (skip header)
    for (let i = 1; i < rows.length; i++) {
      try {
        const row = rows[i].trim()
        if (!row) continue // Skip empty rows
        
        const values = row.split(',').map(v => v.trim())
        const vehicleData = {
          make: values[headers.indexOf('make')],
          model: values[headers.indexOf('model')],
          year: parseInt(values[headers.indexOf('year')]),
          color: headers.includes('color') ? values[headers.indexOf('color')] : null,
          license_plate: values[headers.indexOf('license_plate')],
          vin: values[headers.indexOf('vin')],
          mileage: headers.includes('mileage') ? parseInt(values[headers.indexOf('mileage')]) || 0 : 0,
          status: headers.includes('status') ? values[headers.indexOf('status')] : 'available'
        }

        // Validate required fields for each row
        const missingValues = Object.entries(vehicleData)
          .filter(([key, value]) => requiredFields.includes(key) && !value)
          .map(([key]) => key)

        if (missingValues.length > 0) {
          throw new Error(`Row ${i + 1}: Missing values for ${missingValues.join(', ')}`)
        }

        console.log('Inserting vehicle:', vehicleData)
        const { error: insertError } = await supabase
          .from('vehicles')
          .insert(vehicleData)

        if (insertError) {
          throw insertError
        }

        successCount++
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error)
        errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${successCount} vehicles`,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Import process failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})