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
    console.log('Starting raw financial import processing...');
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Read and parse CSV content
    const csvContent = await file.text();
    const lines = csvContent.split('\n').map(line => 
      line.trim()
        .replace(/\r/g, '') // Remove carriage returns
    ).filter(line => line.length > 0); // Remove empty lines

    if (lines.length < 2) {
      throw new Error('File is empty or contains only headers');
    }

    // Parse headers and validate
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    // Process each row and prepare for insertion
    const importData = lines.slice(1).map((row, rowIndex) => {
      try {
        // Split the row by comma, handling quoted values
        const values = row.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|\d+|[^,]*)/g)
          ?.map(v => v.replace(/^,?"?|"?$/g, '').replace(/""/g, '"').trim()) || [];

        // Create an object with all possible fields
        const rowData: Record<string, any> = {
          lease_id: null,
          customer_name: null,
          amount: null,
          license_plate: null,
          vehicle: null,
          payment_date: null,
          payment_method: null,
          transaction_id: null,
          description: null,
          type: null,
          status: 'pending'
        };

        // Map values to fields based on headers
        headers.forEach((header, index) => {
          const value = values[index];
          const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          
          if (value === undefined || value === '') return;

          switch (normalizedHeader) {
            case 'lease_id':
              rowData.lease_id = value;
              break;
            case 'customer_name':
              rowData.customer_name = value;
              break;
            case 'amount':
              rowData.amount = parseFloat(value) || null;
              break;
            case 'license_plate':
              rowData.license_plate = value;
              break;
            case 'vehicle':
              rowData.vehicle = value;
              break;
            case 'payment_date':
              try {
                const date = new Date(value);
                rowData.payment_date = !isNaN(date.getTime()) ? date.toISOString() : null;
              } catch {
                console.warn(`Invalid date in row ${rowIndex + 2}: ${value}`);
                rowData.payment_date = null;
              }
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
              rowData.status = value || 'pending';
              break;
          }
        });

        return rowData;
      } catch (error) {
        console.error(`Error processing row ${rowIndex + 2}:`, error);
        return null;
      }
    }).filter(row => row !== null); // Remove any rows that failed to process

    console.log(`Processed ${importData.length} valid rows`);

    if (importData.length === 0) {
      throw new Error('No valid rows found in the CSV file');
    }

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
        message: `Successfully imported ${importData.length} rows`,
        processedRows: importData.length
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