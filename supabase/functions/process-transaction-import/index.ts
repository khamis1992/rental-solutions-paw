import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log('Starting transaction import processing...');
    
    // Safely parse the request body
    let body;
    try {
      body = await req.json();
      console.log('Request body received:', {
        fileName: body.fileName,
        headersReceived: body.headers,
        totalRows: body.totalRows,
        hasFileContent: !!body.fileContent
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid request body format');
    }

    // Validate required fields
    const requiredFields = ['fileName', 'fileContent', 'headers'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing file content...');
    const lines = body.fileContent.split('\n').map(line => 
      line.trim()
    ).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      throw new Error('File is empty or contains only headers');
    }

    console.log(`Processing ${lines.length} lines from CSV...`);

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const requiredHeaders = [
      'amount',
      'payment_date',
      'payment_method',
      'status',
      'description',
      'transaction_id',
      'lease_id'
    ];

    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      console.error('Missing required headers:', missingHeaders);
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    // Process each data row
    const processedRows = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        
        // Skip rows with incorrect number of columns
        if (values.length !== headers.length) {
          console.error(`Row ${i + 1}: Invalid number of columns`);
          errors.push(`Row ${i + 1}: Invalid number of columns`);
          continue;
        }

        const rowData = {};
        headers.forEach((header, index) => {
          if (values[index] !== undefined) {
            rowData[header] = values[index];
          }
        });

        console.log(`Processing row ${i}:`, rowData);

        // Store in raw_transaction_imports
        const { error: insertError } = await supabaseAdmin
          .from('raw_transaction_imports')
          .insert({
            raw_data: rowData,
            payment_number: rowData['transaction_id'],
            payment_description: rowData['description'],
            payment_method: rowData['payment_method'],
            is_valid: true
          });

        if (insertError) {
          console.error(`Error storing row ${i}:`, insertError);
          errors.push(`Row ${i + 1}: ${insertError.message}`);
          continue;
        }

        processedRows.push(rowData);
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    console.log('Import completed:', {
      totalRows: lines.length - 1,
      processedRows: processedRows.length,
      errors: errors.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: lines.length - 1,
        processedRows: processedRows.length,
        errors: errors
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
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
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});