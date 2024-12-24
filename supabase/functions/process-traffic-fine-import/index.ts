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

    // Download the JSON file containing the preview data
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const text = await fileData.text();
    const fines = JSON.parse(text);

    let processed = 0;
    const errors = [];
    const importId = crypto.randomUUID();

    // Log the import start
    await supabaseClient
      .from('traffic_fine_imports')
      .insert([{
        id: importId,
        file_name: fileName,
        total_fines: fines.length,
        unassigned_fines: fines.length,
        ai_analysis_status: 'pending'
      }]);

    // Process each fine
    for (const fine of fines) {
      try {
        // Insert the fine
        const { error: insertError } = await supabaseClient
          .from('traffic_fines')
          .insert([{
            serial_number: fine.serial_number,
            violation_number: fine.violation_number,
            violation_date: fine.violation_date,
            license_plate: fine.license_plate,
            fine_location: fine.fine_location,
            violation_charge: fine.violation_charge,
            fine_amount: fine.fine_amount,
            violation_points: fine.violation_points,
            import_batch_id: importId,
            payment_status: 'pending',
            assignment_status: 'pending'
          }]);

        if (insertError) throw insertError;
        processed++;
      } catch (error) {
        console.error(`Error processing fine:`, error);
        errors.push({ fine, error: error.message });
      }
    }

    // Update import record with results
    await supabaseClient
      .from('traffic_fine_imports')
      .update({
        total_fines: processed,
        unassigned_fines: processed,
        import_errors: errors.length > 0 ? errors : null
      })
      .eq('id', importId);

    // Trigger AI analysis in the background
    supabaseClient.functions.invoke('analyze-traffic-fine', {
      body: { importId }
    }).catch(console.error);

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