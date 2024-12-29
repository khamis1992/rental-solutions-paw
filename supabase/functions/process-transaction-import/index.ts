import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    });
  }

  try {
    console.log('Starting transaction import process...');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Get and validate request body
    const text = await req.text();
    console.log('Raw request body:', text);

    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error(`Invalid JSON in request body: ${e.message}`);
    }

    const { fileName } = body;
    
    if (!fileName) {
      throw new Error('No fileName provided');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      throw downloadError;
    }

    // Convert file to text
    const fileText = await fileData.text();
    const lines = fileText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Process each row
    const rows = lines.slice(1).filter(line => line.trim());
    let processedCount = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const values = row.split(',').map(v => v.trim());
        const rowData = headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as Record<string, string>);

        // Store raw import data
        const { error: rawError } = await supabase
          .from('raw_transaction_imports')
          .insert({
            import_id: crypto.randomUUID(),
            raw_data: rowData,
            payment_number: rowData['Payment Number'],
            payment_description: rowData['Payment Description'],
            license_plate: rowData['License Plate'],
            vehicle_details: rowData['Vehicle'],
            payment_method: rowData['Payment Method']?.toLowerCase(),
            is_valid: true
          });

        if (rawError) {
          console.error('Error storing raw import:', rawError);
          errors.push({
            row: processedCount + 1,
            error: rawError.message
          });
        } else {
          processedCount++;
        }
      } catch (error) {
        console.error('Error processing row:', error);
        errors.push({
          row: processedCount + 1,
          error: error.message
        });
      }
    }

    // Create import log
    const { error: logError } = await supabase
      .from('transaction_imports')
      .insert({
        file_name: fileName,
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        records_processed: processedCount,
        errors: errors.length > 0 ? errors : null
      });

    if (logError) {
      console.error('Error creating import log:', logError);
      throw logError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errors
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
      }
    );

  } catch (error) {
    console.error('Import process error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});