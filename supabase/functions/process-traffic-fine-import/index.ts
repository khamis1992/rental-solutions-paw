import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { parseCSVRow, validateRow, validateDate, validateNumeric } from './csvParser.ts'
import { insertTrafficFine, logImport } from './dbOperations.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting traffic fine import process...');
    
    const { fileName } = await req.json();
    
    if (!fileName) {
      throw new Error('fileName is required');
    }

    console.log('Processing file:', fileName);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const text = await fileData.text();
    const rows = text.split('\n')
      .map(row => row.trim())
      .filter(row => row.length > 0);

    if (rows.length < 2) {
      throw new Error('File is empty or contains only headers');
    }

    const headers = rows[0].toLowerCase().split(',').map(h => h.trim());
    const expectedColumns = 8;
    
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
        const row = rows[i];
        
        if (!row.trim()) {
          console.log(`Skipping empty row ${i}`);
          continue;
        }

        const values = parseCSVRow(row);
        validateRow(i, values, expectedColumns, row);

        // Validate date and numeric values
        const violationDate = validateDate(values[2], i);
        const amount = validateNumeric(values[6], 'amount', i);
        const points = validateNumeric(values[7], 'points', i);

        await insertTrafficFine(supabaseClient, {
          serial_number: values[0],
          violation_number: values[1],
          violation_date: violationDate.toISOString(),
          license_plate: values[3],
          fine_location: values[4],
          violation_charge: values[5],
          fine_amount: amount,
          violation_points: points
        });

        processed++;
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push({ row: i, error: error.message });
      }
    }

    await logImport(supabaseClient, fileName, processed, errors);

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