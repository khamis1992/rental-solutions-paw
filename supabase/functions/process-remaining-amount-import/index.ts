import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REQUIRED_HEADERS = [
  'Agreement Number',
  'License Plate',
  'Rent Amount',
  'Final Price',
  'Amount Paid',
  'Remaining Amount',
  'Agreement Duration'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file provided or invalid file format')
    }

    const fileContent = await file.text()
    const lines = fileContent.split('\n').map(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('File is empty or contains only headers')
    }

    const headers = lines[0].split(',').map(h => h.trim())
    
    // Validate required headers
    const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const records = []
    const errors = []

    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      
      const values = lines[i].split(',').map(v => v.trim())
      const record = {
        agreement_number: values[headers.indexOf('Agreement Number')],
        license_plate: values[headers.indexOf('License Plate')],
        rent_amount: parseFloat(values[headers.indexOf('Rent Amount')]),
        final_price: parseFloat(values[headers.indexOf('Final Price')]),
        amount_paid: parseFloat(values[headers.indexOf('Amount Paid')]),
        remaining_amount: parseFloat(values[headers.indexOf('Remaining Amount')]),
        agreement_duration: values[headers.indexOf('Agreement Duration')],
        import_status: 'completed'
      }

      // Validate record
      if (isNaN(record.rent_amount) || isNaN(record.final_price) || 
          isNaN(record.amount_paid) || isNaN(record.remaining_amount)) {
        errors.push({ line: i + 1, error: 'Invalid numeric values' })
        continue
      }

      if (!record.agreement_number || !record.license_plate || !record.agreement_duration) {
        errors.push({ line: i + 1, error: 'Missing required fields' })
        continue
      }

      records.push(record)
    }

    if (records.length > 0) {
      const { error: insertError } = await supabase
        .from('remaining_amounts')
        .insert(records)

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: records.length,
        errors: errors.length > 0 ? errors : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing import:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process import',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})