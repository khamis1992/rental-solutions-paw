import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName);

    if (downloadError) throw downloadError;

    // Parse CSV content
    const text = await fileData.text();
    const lines = text.split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Process each line
    const processedRows = [];
    let errorRows = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const row = headers.reduce((obj: any, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});

      try {
        // Validate required fields
        if (!row.date || !row.amount || isNaN(parseFloat(row.amount))) {
          throw new Error('Invalid date or amount format');
        }

        processedRows.push({
          transaction_date: row.date,
          amount: parseFloat(row.amount),
          description: row.description,
          status: 'pending'
        });
      } catch (error) {
        errorRows.push({
          row_number: i,
          error: error.message,
          data: row
        });
      }
    }

    // Update import log with results
    const { error: updateError } = await supabase
      .from('transaction_imports')
      .update({
        status: errorRows.length > 0 ? 'completed_with_errors' : 'completed',
        records_processed: processedRows.length,
        errors: errorRows.length > 0 ? errorRows : null
      })
      .eq('file_name', fileName);

    if (updateError) throw updateError;

    // Insert processed rows
    if (processedRows.length > 0) {
      const { error: insertError } = await supabase
        .from('transaction_import_items')
        .insert(processedRows);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedRows.length,
        errors: errorRows.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing import:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process import',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});