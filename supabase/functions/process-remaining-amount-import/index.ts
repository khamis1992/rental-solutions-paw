import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REQUIRED_HEADERS = [
  'Agreement Number',
  'License Plate',
  'rent amount',
  'final price',
  'amout paid',
  'remaining amount',
  'Agreement Duration'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();
    
    if (!fileName) {
      throw new Error('No file name provided')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error('Failed to download file');
    }

    // Convert the file to text
    const fileContent = await fileData.text();
    console.log('Raw file content:', fileContent);
    
    // Split by newlines and clean up each line
    const lines = fileContent.split('\n').map(line => 
      line.trim()
        .replace(/\r/g, '') // Remove carriage returns but keep tabs
    ).filter(line => line.length > 0); // Remove empty lines
    
    if (lines.length < 2) {
      throw new Error('File is empty or contains only headers');
    }

    // Split headers by tab and clean them
    const headers = lines[0].split('\t').map(h => 
      h.trim()
        .replace(/^"|"$/g, '') // Remove quotes
        .replace(/\s+/g, ' ') // Normalize spaces
    );
    
    console.log('Detected headers:', headers);
    
    // Validate required headers
    const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const records = [];
    const errors = [];

    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t').map(v => 
        v.trim()
          .replace(/^"|"$/g, '') // Remove quotes
      );
      
      console.log(`Processing line ${i}:`, values);

      if (values.length !== REQUIRED_HEADERS.length) {
        errors.push({ line: i + 1, error: 'Invalid number of columns' });
        continue;
      }

      const record = {
        agreement_number: values[headers.indexOf('Agreement Number')],
        license_plate: values[headers.indexOf('License Plate')],
        rent_amount: parseFloat(values[headers.indexOf('rent amount')]),
        final_price: parseFloat(values[headers.indexOf('final price')]),
        amount_paid: parseFloat(values[headers.indexOf('amout paid')]),
        remaining_amount: parseFloat(values[headers.indexOf('remaining amount')]),
        agreement_duration: values[headers.indexOf('Agreement Duration')] + ' months',
        import_status: 'completed'
      };

      console.log('Parsed record:', record);

      // Validate record
      if (isNaN(record.rent_amount) || isNaN(record.final_price) || 
          isNaN(record.amount_paid) || isNaN(record.remaining_amount)) {
        errors.push({ line: i + 1, error: 'Invalid numeric values' });
        continue;
      }

      if (!record.agreement_number || !record.license_plate) {
        errors.push({ line: i + 1, error: 'Missing required fields' });
        continue;
      }

      records.push(record);
    }

    console.log(`Processing ${records.length} valid records`);

    if (records.length > 0) {
      const { error: insertError } = await supabase
        .from('remaining_amounts')
        .insert(records);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: records.length,
        errors: errors.length > 0 ? errors : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing import:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process import',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
})