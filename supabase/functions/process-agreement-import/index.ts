import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';
import { processImportData } from './processData.ts';

console.log("Loading agreement import function...");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  try {
    console.log('Starting agreement import process...');
    
    // Log request details for debugging
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Get and validate the request body
    let body;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      body = JSON.parse(text || '{}');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }
    
    console.log('Parsed request body:', body);

    const { fileName } = body;
    if (!fileName) {
      throw new Error('fileName is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the file from storage
    console.log('Downloading file from storage:', fileName);
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert the file to text and parse CSV
    const text = await fileData.text();
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    const { successCount, errorCount, errors } = await processImportData(
      supabase,
      rows,
      headers,
      fileName
    );

    // Update import log with final status
    const { error: updateError } = await supabase
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: successCount,
        errors: errors.length > 0 ? errors : null
      })
      .eq('file_name', fileName);

    if (updateError) {
      console.error('Error updating import log:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed. Successfully processed ${successCount} agreements with ${errorCount} errors.`,
        processed: successCount,
        errors: errorCount,
        errorDetails: errors
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
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});