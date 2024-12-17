import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileName } = await req.json()
    console.log('Processing vehicle import file:', fileName)

    if (!fileName) {
      throw new Error('fileName is required')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('imports')
      .download(fileName)

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    // Convert the file to text and parse CSV
    const text = await fileData.text()
    const rows = text.split('\n')
    const headers = rows[0].toLowerCase().split(',').map(h => h.trim())
    console.log('CSV Headers:', headers)

    const requiredFields = ['make', 'model', 'year', 'license_plate', 'vin']
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
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

        // Validate required fields
        for (const field of requiredFields) {
          if (!vehicleData[field as keyof typeof vehicleData]) {
            throw new Error(`Missing value for required field: ${field}`)
          }
        }

        // Insert vehicle data
        const { error: insertError } = await supabase
          .from('vehicles')
          .insert(vehicleData)

        if (insertError) throw insertError

        successCount++
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error)
        errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed. Successfully processed ${successCount} vehicles with ${errors.length} errors.`,
        errors
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
        status: 500
      }
    )
  }
})