import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting payment import analysis...');

    // Validate request content type
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('Invalid content type:', contentType);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid content type. Expected multipart/form-data'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Get the form data from the request
    let formData;
    try {
      formData = await req.formData();
      console.log('Form data received');
    } catch (error) {
      console.error('Form data parsing error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to parse form data'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Get the file from form data
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      console.error('No file uploaded or invalid file');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No file uploaded or invalid file format'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('File received:', file.name, 'Size:', file.size);

    // Read file content
    let fileContent;
    try {
      fileContent = await file.text();
      console.log('File content read successfully');
      
      if (!fileContent || fileContent.trim() === '') {
        console.error('Empty file content');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'File is empty'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
      console.log('File content length:', fileContent.length);
    } catch (error) {
      console.error('Error reading file:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to read file content'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Parse CSV content
    const lines = fileContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      console.error('File has no data rows');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'File must contain headers and at least one data row'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Headers found:', headers);

    // Define required fields
    const requiredFields = [
      'Amount',
      'Payment_Date',
      'Payment_Method',
      'Status',
      'Description',
      'Transaction_ID',
      'Lease_ID'
    ];

    // Check for missing required fields
    const missingFields = requiredFields.filter(field => 
      !headers.some(h => h === field)
    );

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          issues: [`The CSV file is missing the following required fields: ${missingFields.join(', ')}`]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Parse data rows with validation
    const data = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        } else {
          console.warn(`Invalid row ${i + 1}: incorrect number of columns`);
          errors.push(`Row ${i + 1} has incorrect number of columns`);
        }
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push(`Error in row ${i + 1}: ${error.message}`);
      }
    }

    console.log('Successfully parsed', data.length, 'rows');
    if (errors.length > 0) {
      console.log('Found', errors.length, 'errors during parsing');
    }

    // Prepare analysis result
    const analysis = {
      success: true,
      totalRows: data.length,
      validRows: data.length,
      invalidRows: errors.length,
      totalAmount: data.reduce((sum, row) => sum + (parseFloat(row['Amount']) || 0), 0),
      rawData: data,
      issues: errors.length > 0 ? errors : [],
      suggestions: errors.length > 0 ? [
        'Ensure all rows have the correct number of columns',
        'Check for any special characters that might affect CSV parsing',
        'Verify that all required fields have valid values'
      ] : []
    };

    console.log('Analysis completed:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process file',
        issues: ['An unexpected error occurred while processing the file']
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})