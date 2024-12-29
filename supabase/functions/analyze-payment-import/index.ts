import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('Starting payment import analysis...');
    
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const csvContent = await file.text();
    const lines = csvContent.split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

    const requiredFields = [
      'lease_id',
      'customer_name',
      'amount',
      'license_plate',
      'vehicle',
      'payment_date',
      'payment_method',
      'transaction_id',
      'description',
      'type',
      'status'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !headers.includes(field.toLowerCase())
    );

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(', ')}`,
          issues: [`The CSV file is missing the following required fields: ${missingFields.join(', ')}`],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get column indices for required fields
    const columnIndices = requiredFields.reduce((acc, field) => {
      acc[field] = headers.indexOf(field.toLowerCase());
      return acc;
    }, {} as Record<string, number>);

    // Parse and analyze the data
    const rows = lines.slice(1).filter(line => line.trim() !== '');
    let validRows = 0;
    let invalidRows = 0;
    let totalAmount = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];
    const parsedRows: any[] = [];

    rows.forEach((row, index) => {
      const values = row.split(',').map(v => v.trim());
      let rowError = false;
      const rowData: any = {};

      // Basic validation
      if (values.length !== headers.length) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid number of columns`);
        rowError = true;
        return;
      }

      // Parse and validate each field
      requiredFields.forEach(field => {
        const value = values[columnIndices[field]];
        rowData[field] = value;
        
        if (field === 'amount') {
          const amount = parseFloat(value);
          if (isNaN(amount)) {
            rowError = true;
            issues.push(`Row ${index + 2}: Invalid amount format`);
          } else {
            totalAmount += amount;
          }
        }
      });

      if (!rowError) {
        validRows++;
        parsedRows.push(rowData);
      } else {
        invalidRows++;
      }
    });

    // Add suggestions based on analysis
    if (invalidRows > 0) {
      suggestions.push('Please review and correct the invalid entries before importing');
    }
    if (validRows === 0) {
      suggestions.push('No valid rows found in the file');
    }

    console.log('Analysis completed successfully');
    console.log(`Found ${validRows} valid rows and ${invalidRows} invalid rows`);
    console.log('First valid row example:', parsedRows[0]);

    return new Response(
      JSON.stringify({
        totalRows: rows.length,
        validRows,
        invalidRows,
        totalAmount,
        issues,
        suggestions,
        rows: parsedRows, // Include the parsed rows in the response
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});