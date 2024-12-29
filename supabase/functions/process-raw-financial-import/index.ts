import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts';

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
    console.log('Starting raw financial import processing...');
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      throw new Error('No file uploaded');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Read and parse CSV content
    const csvContent = await file.text();
    const rows = parse(csvContent, { skipFirstRow: true });
    const headers = parse(csvContent, { skipFirstRow: false })[0];

    console.log('Processing CSV with headers:', headers);

    // Process each row and prepare for insertion
    const importData = rows.map(row => {
      const rowData: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        rowData[header.trim()] = row[index]?.trim() || null;
      });
      return rowData;
    });

    console.log(`Inserting ${importData.length} rows into financial_imports`);

    // Insert all rows into financial_imports table
    const { error: insertError } = await supabaseClient
      .from('financial_imports')
      .insert(importData);

    if (insertError) {
      console.error('Error inserting data:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully imported ${importData.length} rows` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
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
        status: 400 
      }
    );
  }
});