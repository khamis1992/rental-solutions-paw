import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Function invoked with request:', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileName } = await req.json()
    console.log('Processing file:', fileName)
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Supabase client created')

    // Download file content
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName)

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    const content = await fileData.text()
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    // Skip header row
    const rows = lines.slice(1)
    console.log(`Processing ${rows.length} rows`)

    for (const row of rows) {
      try {
        const values = row.split(',')
        const fineData = {
          serial_number: values[0] || null,
          violation_number: values[1] || null,
          violation_date: values[2] || null,
          license_plate: values[3] || null,
          fine_location: values[4] || null,
          violation_charge: values[5] || null,
          fine_amount: parseFloat(values[6]) || 0,
          violation_points: parseInt(values[7]) || 0,
          payment_status: 'pending',
          assignment_status: 'pending',
          created_at: new Date().toISOString()
        }

        const { error: insertError } = await supabase
          .from('traffic_fines')
          .insert([fineData])

        if (insertError) {
          console.error('Insert error for row:', row, insertError)
        }
      } catch (rowError) {
        console.error('Error processing row:', row, rowError)
        // Continue with next row even if this one fails
      }
    }

    // Log import
    const { error: logError } = await supabase
      .from('traffic_fine_imports')
      .insert([{
        file_name: fileName,
        processed_at: new Date().toISOString(),
        total_fines: rows.length,
        processed_by: req.headers.get('x-user-id')
      }])

    if (logError) {
      console.error('Log error:', logError)
    }

    console.log('Processing completed successfully')
    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: rows.length 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Processing error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})