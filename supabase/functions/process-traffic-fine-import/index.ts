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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw downloadError;
    }

    // Parse CSV content
    const text = await fileData.text();
    const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    const headers = rows[0].toLowerCase().split(',').map(h => h.trim());
    
    console.log('File headers:', headers);
    
    let processed = 0;
    const errors = [];

    // Process each row (skip header)
    for (let i = 1; i < rows.length; i++) {
      try {
        const values = rows[i].split(',').map(v => v.trim());
        const fine = {};
        
        headers.forEach((header, index) => {
          if (header === 'fine_date') {
            fine[header] = new Date(values[index]).toISOString();
          } else if (header === 'fine_amount') {
            fine[header] = parseFloat(values[index]);
          } else {
            fine[header] = values[index];
          }
        });

        // Insert the fine record
        const { error: insertError } = await supabaseClient
          .from('traffic_fines')
          .insert([{
            ...fine,
            assignment_status: 'pending',
            payment_status: 'pending'
          }]);

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