import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting traffic fine import process...');
    
    // Parse request body
    const { fileName } = await req.json();
    
    if (!fileName) {
      throw new Error('fileName is required');
    }

    console.log('Processing file:', fileName);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Parse CSV content with improved error handling
    const text = await fileData.text();
    // Split by newline and filter out empty lines and whitespace-only lines
    const rows = text.split('\n')
      .map(row => row.trim())
      .filter(row => row.length > 0);

    if (rows.length < 2) {
      throw new Error('File is empty or contains only headers');
    }

    const headers = rows[0].toLowerCase().split(',').map(h => h.trim());
    const expectedColumns = 8; // We expect 8 columns based on our schema
    
    console.log('Processing CSV with headers:', headers);
    console.log(`Expected columns: ${expectedColumns}, Found: ${headers.length}`);

    if (headers.length !== expectedColumns) {
      throw new Error(`Invalid header count. Expected ${expectedColumns} columns, found ${headers.length}`);
    }

    let processed = 0;
    const errors = [];

    // Process each row (skip header)
    for (let i = 1; i < rows.length; i++) {
      try {
        // Split the row and clean each value
        const values = rows[i].split(',').map(v => v.trim());
        
        // Validate row structure
        if (values.length !== expectedColumns) {
          console.error(`Row ${i} has incorrect number of columns. Expected: ${expectedColumns}, Found: ${values.length}`);
          console.error('Row content:', rows[i]);
          throw new Error(`Invalid number of columns in row ${i}. Expected ${expectedColumns}, found ${values.length}`);
        }

        // Validate date format
        const dateValue = new Date(values[2]);
        if (isNaN(dateValue.getTime())) {
          throw new Error(`Invalid date format in row ${i}: ${values[2]}`);
        }

        // Validate numeric values
        const amount = parseFloat(values[6]);
        if (isNaN(amount)) {
          throw new Error(`Invalid amount in row ${i}: ${values[6]}`);
        }

        const points = parseInt(values[7], 10);
        if (isNaN(points)) {
          throw new Error(`Invalid points in row ${i}: ${values[7]}`);
        }

        // Map CSV columns to database columns
        const fine = {
          serial_number: values[0],
          violation_number: values[1],
          violation_date: dateValue.toISOString(),
          license_plate: values[3],
          fine_location: values[4],
          violation_charge: values[5],
          fine_amount: amount,
          violation_points: points,
          assignment_status: 'pending',
          payment_status: 'pending'
        };

        console.log(`Processing row ${i}:`, fine);

        const { error: insertError } = await supabaseClient
          .from('traffic_fines')
          .insert([fine]);

        if (insertError) {
          console.error(`Error inserting row ${i}:`, insertError);
          errors.push({ row: i, error: insertError.message });
        } else {
          processed++;
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push({ row: i, error: error.message });
      }
    }

    // Log import results
    const { error: logError } = await supabaseClient
      .from('traffic_fine_imports')
      .insert([{
        file_name: fileName,
        total_fines: processed,
        unassigned_fines: processed,
        import_errors: errors.length > 0 ? errors : null
      }]);

    if (logError) {
      console.error('Error logging import:', logError);
    }

    console.log('Import completed:', { processed, errors: errors.length });

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        errors: errors.length > 0 ? errors : null
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Import process failed:', error);
    
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
    );
  }
});