import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting transaction import process...');
    
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    console.log('Uploading file to storage:', fileName);
    
    const { error: uploadError } = await supabase.storage
      .from('imports')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Create import log
    const { data: importLog, error: logError } = await supabase
      .from('transaction_imports')
      .insert({
        file_name: fileName,
        status: 'pending',
      })
      .select()
      .single();

    if (logError) {
      console.error('Import log creation error:', logError);
      throw logError;
    }

    // Process the file content
    const text = await file.text();
    const lines = text.split('\n');
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
            import_id: importLog.id,
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

    // Update import status
    await supabase
      .from('transaction_imports')
      .update({
        status: 'completed',
        records_processed: processedCount,
        errors: errors.length > 0 ? errors : null
      })
      .eq('id', importLog.id);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});