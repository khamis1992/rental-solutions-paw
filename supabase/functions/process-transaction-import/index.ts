import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let body;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      body = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid JSON in request body: ${e.message}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate request body
    if (!body?.fileName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing fileName in request body'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create import record first
    const { data: importRecord, error: importError } = await supabase.rpc(
      'create_transaction_import',
      { p_file_name: body.fileName }
    );

    if (importError) {
      console.error('Error creating import record:', importError);
      throw importError;
    }

    const importId = importRecord;
    console.log('Created import record with ID:', importId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(body.fileName);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      throw downloadError;
    }

    // Process the file
    const fileText = await fileData.text();
    const lines = fileText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).filter(line => line.trim());

    let totalAmount = 0;
    let validRows = 0;
    let invalidRows = 0;
    const issues = [];
    const suggestions = [];

    // Process each row
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
            import_id: importId,
            raw_data: rowData,
            is_valid: true
          });

        if (rawError) {
          console.error('Error storing raw import:', rawError);
          invalidRows++;
          issues.push(`Error storing row: ${rawError.message}`);
        } else {
          validRows++;
          const amount = parseFloat(rowData.Amount || '0');
          if (!isNaN(amount)) {
            totalAmount += amount;
          }
        }
      } catch (error) {
        console.error('Error processing row:', error);
        invalidRows++;
        issues.push(`Error processing row: ${error.message}`);
      }
    }

    // Update import record with results
    const { error: updateError } = await supabase
      .from('transaction_imports')
      .update({
        status: issues.length > 0 ? 'completed_with_errors' : 'completed',
        records_processed: validRows,
        errors: issues.length > 0 ? issues : null
      })
      .eq('id', importId);

    if (updateError) {
      console.error('Error updating import record:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: rows.length,
        validRows,
        invalidRows,
        totalAmount,
        issues,
        suggestions
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});