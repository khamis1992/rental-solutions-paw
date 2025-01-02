import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAndRepairRow } from './validator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  issues: string[];
  suggestions: string[];
  rawData: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting payment import analysis...');
    
    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('Invalid content type:', contentType);
      throw new Error('Invalid content type. Expected multipart/form-data');
    }

    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error('Error parsing form data:', error);
      throw new Error('Failed to parse form data');
    }

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      console.error('No file uploaded or invalid file');
      throw new Error('No file uploaded or invalid file');
    }

    console.log('File received:', file.name, 'Size:', file.size);

    let csvContent;
    try {
      csvContent = await file.text();
      console.log('CSV content length:', csvContent.length);
    } catch (error) {
      console.error('Error reading file content:', error);
      throw new Error('Failed to read file content');
    }

    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('File is empty or contains only headers');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Headers found:', headers);

    const requiredFields = [
      'Amount',
      'Payment_Date',
      'Payment_Method',
      'Status',
      'Description',
      'Transaction_ID',
      'Lease_ID'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !headers.some(h => h === field)
    );

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          issues: [`The CSV file is missing the following required fields: ${missingFields.join(', ')}`],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Process and repair each row
    const rows = lines.slice(1);
    let validRows = 0;
    let invalidRows = 0;
    let totalAmount = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];
    const repairedData: any[] = [];
    const allRepairs: string[] = [];

    console.log('Processing', rows.length, 'rows');

    rows.forEach((row, index) => {
      const values = row.split(',').map(v => v.trim());
      const rowData = headers.reduce((obj, header, i) => {
        obj[header] = values[i] || '';
        return obj;
      }, {} as Record<string, string>);

      const { isValid, repairs, errors, repairedData: repairedRow } = validateAndRepairRow(rowData, index);

      if (isValid) {
        validRows++;
        repairedData.push(repairedRow);
        totalAmount += parseFloat(repairedRow.Amount);
        if (repairs.length > 0) {
          allRepairs.push(...repairs);
        }
      } else {
        invalidRows++;
        issues.push(...errors);
      }
    });

    // Generate suggestions based on repairs and issues
    if (allRepairs.length > 0) {
      suggestions.push('The following automatic repairs were made:');
      suggestions.push(...allRepairs);
    }

    if (invalidRows > 0) {
      suggestions.push('Please review and correct the invalid entries before importing');
    }

    const result: AnalysisResult = {
      success: invalidRows === 0,
      totalRows: rows.length,
      validRows,
      invalidRows,
      totalAmount,
      issues,
      suggestions,
      rawData: repairedData
    };

    console.log('Analysis completed successfully:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});