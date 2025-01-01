import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './corsHeaders.ts';
import { validateAnalysisResult } from './validators.ts';
import { processPayments } from './processor.ts';
import { RequestPayload } from './types.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting payment import process...');
    
    // Initialize Supabase client with error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Parse and validate request body with detailed error handling
    let payload: RequestPayload;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      
      if (!text) {
        throw new Error('Request body is empty');
      }

      payload = JSON.parse(text);
      console.log('Parsed payload:', JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON payload',
          details: error.message
        }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate analysis result with improved error messages
    if (!payload.analysisResult || !validateAnalysisResult(payload.analysisResult)) {
      console.error('Invalid analysis result structure');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid analysis result structure. Required fields missing or invalid.',
          expectedFields: ['success', 'totalRows', 'validRows', 'invalidRows', 'totalAmount', 'rawData']
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process payments
    const results = await processPayments(supabaseClient, payload.analysisResult.rawData);
    const successCount = results.filter(r => r.success).length;
    const errors = results.filter(r => !r.success);

    console.log(`Completed processing with ${successCount} successes and ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Successfully processed ${successCount} payments with ${errors.length} errors`,
        processed: successCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Fatal error in payment import process:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error during payment import',
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