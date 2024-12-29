import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting raw transaction import processing...');
    
    // Parse request body
    const { fileName } = await req.json();
    
    if (!fileName) {
      throw new Error('Missing fileName in request body');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Downloading file:', fileName);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      throw downloadError;
    }

    // Process the file content
    const fileContent = await fileData.text();
    const lines = fileContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    console.log(`Processing ${lines.length} lines from CSV...`);

    // Create import record
    const importId = crypto.randomUUID();
    const { error: importError } = await supabaseClient
      .from('transaction_imports')
      .insert({
        id: importId,
        file_name: fileName,
        status: 'processing',
        records_processed: 0
      });

    if (importError) {
      console.error('Error creating import record:', importError);
      throw importError;
    }

    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    // Process each line (skip header)
    let processedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: Record<string, any> = {};
        
        // Map values to headers
        headers.forEach((header, index) => {
          rowData[header] = values[index] || null;
        });

        console.log(`Processing row ${i}:`, rowData);

        // Store raw data without validation
        const { error: rawError } = await supabaseClient
          .from('raw_transaction_imports')
          .insert({
            import_id: importId,
            raw_data: rowData
          });

        if (rawError) {
          console.error(`Error storing row ${i}:`, rawError);
          continue;
        }

        processedCount++;
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        continue;
      }
    }

    // Update import record with results
    const { error: updateError } = await supabaseClient
      .from('transaction_imports')
      .update({
        status: 'completed',
        records_processed: processedCount
      })
      .eq('id', importId);

    if (updateError) {
      console.error('Error updating import record:', updateError);
      throw updateError;
    }

    console.log(`Import completed. Processed ${processedCount} rows.`);

    return new Response(
      JSON.stringify({
        success: true,
        importId,
        totalRows: lines.length - 1,
        processedRows: processedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import process error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});