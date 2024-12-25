import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Function invoked with request:', req.method)

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
      throw downloadError
    }

    // Convert file content to text
    const content = await fileData.text()
    const rows = content.split('\n').filter(row => row.trim())
    console.log(`Processing ${rows.length} rows`)

    // Process each row without validation
    for (const row of rows) {
      try {
        const values = row.split(',').map(v => v.trim())
        const rowData: Record<string, any> = {}
        
        // Store all values without validation
        values.forEach((value, index) => {
          if (value) {
            rowData[`column_${index + 1}`] = value
          }
        })

        // Insert raw data
        const { error: insertError } = await supabase
          .from('traffic_fines')
          .insert([rowData])

        if (insertError) {
          console.error('Error inserting row:', insertError)
          continue // Continue with next row even if this one fails
        }
      } catch (rowError) {
        console.error('Error processing row:', rowError)
        continue // Skip problematic rows
      }
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
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    )
  }
})