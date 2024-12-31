import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

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
    console.log('Processing payment import request');
    
    const { fileName, fileContent } = await req.json();
    
    if (!fileName || !fileContent) {
      console.error('Missing required fields:', { fileName: !!fileName, fileContent: !!fileContent });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Received file:', fileName, 'Content length:', fileContent.length);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store raw data in Supabase
    const { data, error } = await supabase
      .from('raw_transaction_imports')
      .insert({
        raw_data: JSON.parse(fileContent),
        is_valid: true,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Successfully stored import data:', data);

    return new Response(
      JSON.stringify({
        success: true,
        validRows: Array.isArray(data) ? data.length : 1,
        errors: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing payment import:', error);
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