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

    // Get the form data from the request
    const formData = await req.formData();
    console.log('Form data received');

    // Get the file from form data
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      console.error('No file uploaded or invalid file');
      throw new Error('No file uploaded or invalid file format');
    }

    console.log('File received:', file.name, 'Size:', file.size);

    // Read file content
    const fileContent = await file.text();
    if (!fileContent || fileContent.trim() === '') {
      console.error('Empty file content');
      throw new Error('File is empty');
    }

    console.log('File content length:', fileContent.length);

    // Parse CSV content
    const lines = fileContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      console.error('File has no data rows');
      throw new Error('File must contain headers and at least one data row');
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

    // Parse data rows
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    console.log('Successfully parsed', data.length, 'rows');

    // Analyze the data
    const analysis = {
      success: true,
      totalRows: data.length,
      validRows: data.length,
      invalidRows: 0,
      totalAmount: data.reduce((sum, row) => sum + (parseFloat(row['Amount']) || 0), 0),
      rawData: data,
      issues: [],
      suggestions: []
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