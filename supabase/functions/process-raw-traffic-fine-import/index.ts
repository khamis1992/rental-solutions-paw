import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();
    console.log('Processing raw file:', fileName);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download file content
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const content = await fileData.text();
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const rows = [];

    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(val => val.trim());
      if (values.length >= headers.length) {
        const row = {
          serial_number: values[0],
          violation_number: values[1],
          violation_date: values[2],
          license_plate: values[3],
          fine_location: values[4],
          violation_charge: values[5],
          fine_amount: parseFloat(values[6]) || 0,
          violation_points: parseInt(values[7]) || 0,
          payment_status: 'pending',
          assignment_status: 'pending',
          entry_type: 'imported',
          validation_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        rows.push(row);
      }
    }

    // Insert all rows in batches
    const batchSize = 50;
    const results = [];
    const errors = [];

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('traffic_fines')
        .insert(batch)
        .select();

      if (error) {
        console.error('Batch insert error:', error);
        errors.push({
          batch: i / batchSize + 1,
          error: error.message
        });
      } else {
        results.push(...(data || []));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});