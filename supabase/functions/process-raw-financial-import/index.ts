import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://preview--rental-solutions.lovable.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        // Map CSV headers to database columns (case-insensitive)
        const headerKey = header.trim();
        const value = row[index]?.trim() || null;

        // Map the headers to database columns
        switch (headerKey.toLowerCase()) {
          case 'lease_id':
            rowData.lease_id = value;
            break;
          case 'customer_name':
            rowData.customer_name = value;
            break;
          case 'amount':
            rowData.amount = value ? parseFloat(value) : null;
            break;
          case 'license_plate':
            rowData.license_plate = value;
            break;
          case 'vehicle':
            rowData.vehicle = value;
            break;
          case 'payment_date':
            rowData.payment_date = value;
            break;
          case 'payment_method':
            rowData.payment_method = value;
            break;
          case 'transaction_id':
            rowData.transaction_id = value;
            break;
          case 'description':
            rowData.description = value;
            break;
          case 'type':
            rowData.type = value;
            break;
          case 'status':
            rowData.status = value;
            break;
          default:
            // Ignore any unrecognized headers
            console.log(`Ignoring unrecognized header: ${headerKey}`);
        }
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