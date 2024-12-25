import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileName } = await req.json()
    
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
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const headers = lines[0].toLowerCase().split(',')
    const rows = lines.slice(1)

    // Process each row without validation
    for (const row of rows) {
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: insertError } = await supabase
        .from('traffic_fines')
        .insert([fineData])

      if (insertError) {
        console.error('Insert error:', insertError)
      }
    }

    // Log the import
    const { error: logError } = await supabase
      .from('traffic_fine_imports')
      .insert([{
        file_name: fileName,
        processed_at: new Date().toISOString(),
        total_fines: rows.length,
        unassigned_fines: rows.length
      }])

    if (logError) {
      console.error('Log error:', logError)
    }

    return new Response(
      JSON.stringify({ success: true, processed: rows.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})