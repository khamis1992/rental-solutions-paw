import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const expectedHeaders = [
  'Lease_ID',
  'Customer_Name',
  'Amount',
  'License_Plate',
  'Vehicle',
  'Payment_Date',
  'Payment_Method',
  'Transaction_ID',
  'Description',
  'Type',
  'Status'
];

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
    
    // Parse CSV with options to handle empty lines and trim whitespace
    const parsedRows = parse(csvContent, { 
      skipFirstRow: false,
      trimLeadingSpace: true,
      skipEmptyLines: true 
    });

    // Validate and normalize headers
    const headers = parsedRows[0].map(h => h.trim());
    console.log('CSV Headers:', headers);

    // Validate that all required headers are present
    const missingHeaders = expectedHeaders.filter(
      expected => !headers.some(h => h.toLowerCase() === expected.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      console.error('Missing required headers:', missingHeaders);
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    // Process each row and prepare for insertion
    const importData = parsedRows.slice(1).map((row, rowIndex) => {
      try {
        const rowData: Record<string, any> = {};
        
        // Fill missing values with null and ignore extra columns
        expectedHeaders.forEach((header, index) => {
          const headerIndex = headers.findIndex(h => 
            h.toLowerCase() === header.toLowerCase()
          );
          
          let value = headerIndex >= 0 && row[headerIndex] 
            ? row[headerIndex].trim() 
            : null;

          // Convert empty strings to null
          if (value === '') value = null;

          // Special handling for specific fields
          switch (header.toLowerCase()) {
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
              // Try to parse the date in various formats
              try {
                const date = value ? new Date(value) : null;
                rowData.payment_date = date && !isNaN(date.getTime()) 
                  ? date.toISOString() 
                  : null;
              } catch {
                console.warn(`Invalid date format in row ${rowIndex + 2}: ${value}`);
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