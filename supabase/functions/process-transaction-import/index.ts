import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REQUIRED_HEADERS = [
  'Amount',
  'Payment_Date',
  'Payment_Method',
  'Status',
  'Description',
  'Transaction_ID',
  'Lease_ID'
];

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    message: string;
    data?: any;
  }>;
}

function validateCSVStructure(headers: string[]): { isValid: boolean; missingHeaders: string[] } {
  const missingHeaders = REQUIRED_HEADERS.filter(
    required => !headers.map(h => h.trim()).includes(required)
  );
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
}

function validateRow(row: string[], headers: string[], rowIndex: number): ValidationResult {
  const errors = [];
  const rowData: Record<string, string> = {};

  // Map row values to headers
  headers.forEach((header, index) => {
    rowData[header.trim()] = row[index]?.trim() || '';
  });

  // Validate Amount
  if (!rowData.Amount || isNaN(Number(rowData.Amount))) {
    errors.push({
      row: rowIndex,
      message: 'Invalid amount value',
      data: rowData.Amount
    });
  }

  // Validate Payment_Date
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!rowData.Payment_Date || !dateRegex.test(rowData.Payment_Date)) {
    errors.push({
      row: rowIndex,
      message: 'Invalid date format. Expected DD-MM-YYYY',
      data: rowData.Payment_Date
    });
  }

  // Validate required fields
  REQUIRED_HEADERS.forEach(header => {
    if (!rowData[header]) {
      errors.push({
        row: rowIndex,
        message: `Missing required field: ${header}`,
        data: rowData
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting transaction import processing...');
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid JSON in request body: ${error.message}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { fileName } = body;
    if (!fileName) {
      throw new Error('Missing fileName in request body');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Downloading file:', fileName);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      throw downloadError;
    }

    // Process the file content
    const fileContent = await fileData.text();
    console.log('File content received, starting validation...');

    // Split content into lines and clean them
    const lines = fileContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error('File is empty or contains only headers');
    }

    // Validate headers
    const headers = lines[0].split(',').map(h => h.trim());
    const headerValidation = validateCSVStructure(headers);
    
    if (!headerValidation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Missing required headers: ${headerValidation.missingHeaders.join(', ')}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create import record
    const { data: importRecord, error: importError } = await supabaseClient.rpc(
      'create_transaction_import',
      { p_file_name: fileName }
    );

    if (importError) {
      console.error('Error creating import record:', importError);
      throw importError;
    }

    const importId = importRecord;
    console.log('Created import record with ID:', importId);

    // Process each row
    let validRows = 0;
    let invalidRows = 0;
    let totalAmount = 0;
    const errors = [];
    const processedRows = [];

    // Process rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        
        // Validate row
        const validation = validateRow(values, headers, i);
        
        if (!validation.isValid) {
          invalidRows++;
          errors.push(...validation.errors);
          continue;
        }

        // Create row data object
        const rowData = headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {} as Record<string, string>);

        // Store raw import data
        const { error: rawError } = await supabaseClient
          .from('raw_transaction_imports')
          .insert({
            import_id: importId,
            raw_data: rowData,
            is_valid: true
          });

        if (rawError) {
          console.error('Error storing raw import:', rawError);
          invalidRows++;
          errors.push({
            row: i,
            message: `Database error: ${rawError.message}`,
            data: rowData
          });
        } else {
          validRows++;
          const amount = parseFloat(rowData.Amount || '0');
          if (!isNaN(amount)) {
            totalAmount += amount;
          }
          processedRows.push(rowData);
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        invalidRows++;
        errors.push({
          row: i,
          message: `Processing error: ${error.message}`
        });
      }
    }

    // Update import record with results
    const { error: updateError } = await supabaseClient
      .from('transaction_imports')
      .update({
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        records_processed: validRows,
        errors: errors.length > 0 ? errors : null
      })
      .eq('id', importId);

    if (updateError) {
      console.error('Error updating import record:', updateError);
      throw updateError;
    }

    // Generate suggestions based on validation results
    const suggestions = [];
    if (invalidRows > 0) {
      suggestions.push('Review and correct invalid rows before proceeding');
      suggestions.push('Ensure all amounts are valid numbers');
      suggestions.push('Verify date format (DD-MM-YYYY) for all entries');
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: lines.length - 1,
        validRows,
        invalidRows,
        totalAmount,
        errors: errors.length > 0 ? errors : null,
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