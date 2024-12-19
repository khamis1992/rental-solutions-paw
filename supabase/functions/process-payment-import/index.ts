import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { processPaymentRow } from './paymentUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 50; // Process 50 records at a time

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const text = await fileData.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('Processing CSV with headers:', headers);
    
    let processedCount = 0;
    const skippedRecords = [];
    const failedRecords = [];

    // Process in batches
    for (let i = 1; i < lines.length; i += BATCH_SIZE) {
      const batch = lines.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}`);

      // Process each line in the batch
      const batchPromises = batch.map(async (line, index) => {
        const lineNumber = i + index;
        try {
          const values = line.trim().split(',').map(v => v.trim());
          console.log(`Processing row ${lineNumber}:`, values);

          const result = await processPaymentRow(supabase, headers, values);
          
          if (result.success) {
            processedCount++;
          } else {
            console.log(`Row ${lineNumber} skipped:`, result.error);
            skippedRecords.push({
              row: lineNumber,
              data: values,
              reason: result.error
            });
          }
        } catch (error) {
          console.error(`Error processing row ${lineNumber}:`, error);
          failedRecords.push({
            row: lineNumber,
            error: error.message
          });
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Update import log after each batch
      await supabase
        .from('import_logs')
        .update({
          status: 'processing',
          records_processed: processedCount,
          errors: {
            skipped: skippedRecords,
            failed: failedRecords
          }
        })
        .eq('file_name', fileName);

      // Add a small delay between batches to prevent resource exhaustion
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final update to import log
    await supabase
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: processedCount,
        errors: {
          skipped: skippedRecords,
          failed: failedRecords
        }
      })
      .eq('file_name', fileName);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        skipped: skippedRecords.length,
        failed: failedRecords.length
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
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});