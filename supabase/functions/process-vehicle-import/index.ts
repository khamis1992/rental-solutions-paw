import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();
    console.log('Processing vehicle import file:', fileName);

    if (!fileName) {
      throw new Error('fileName is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert the file to text and parse CSV
    const text = await fileData.text();
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    // Process each row (skip header)
    const processedRows = await Promise.all(rows.slice(1).map(async (row, index) => {
      try {
        if (!row.trim()) return null; // Skip empty rows
        
        const values = row.split(',').map(v => v.trim());
        const vehicleData = {
          make: values[headers.indexOf('make')],
          model: values[headers.indexOf('model')],
          year: parseInt(values[headers.indexOf('year')]),
          color: values[headers.indexOf('color')],
          license_plate: values[headers.indexOf('license_plate')],
          vin: values[headers.indexOf('vin')],
          daily_rate: parseFloat(values[headers.indexOf('daily_rate')]),
          mileage: parseInt(values[headers.indexOf('mileage')] || '0'),
          status: 'available'
        };

        // Insert vehicle data
        const { error: insertError } = await supabase
          .from('vehicles')
          .insert(vehicleData);

        if (insertError) throw insertError;

        return { success: true, row: index + 2 };
      } catch (error) {
        console.error(`Error processing row ${index + 2}:`, error);
        return { success: false, row: index + 2, error: error.message };
      }
    }));

    const successCount = processedRows.filter(r => r?.success).length;
    const errors = processedRows
      .filter(r => r && !r.success)
      .map(r => `Row ${r?.row}: ${r?.error}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed. Successfully processed ${successCount} vehicles with ${errors.length} errors.`,
        errors: errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Import process failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});