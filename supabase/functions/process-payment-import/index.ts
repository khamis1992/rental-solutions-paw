import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRow {
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  description: string;
  transaction_id: string;
  lease_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fileName, fileContent, action, analysisResult } = await req.json();

    // If this is an implementation request
    if (action === 'implement' && analysisResult) {
      console.log('Implementing changes from analysis result:', analysisResult);
      
      // Process the validated data
      const { error: importError } = await supabase
        .from('raw_payment_imports')
        .insert({
          raw_data: analysisResult,
          is_valid: true,
          created_at: new Date().toISOString()
        });

      if (importError) {
        throw importError;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initial analysis of the file
    console.log('Starting analysis of file:', fileName);

    const lines = fileContent.split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    const headers = lines[0].toLowerCase().split(',').map((h: string) => h.trim());
    const rows = lines.slice(1);

    let validRows = 0;
    let invalidRows = 0;
    let totalAmount = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Get column indices
    const headerMap = {
      amount: headers.indexOf('amount'),
      payment_date: headers.indexOf('payment_date'),
      payment_method: headers.indexOf('payment_method'),
      status: headers.indexOf('status'),
      description: headers.indexOf('description'),
      transaction_id: headers.indexOf('transaction_id'),
      lease_id: headers.indexOf('lease_id')
    };

    // Validate each row
    rows.forEach((row, index) => {
      const values = row.split(',').map(v => v.trim());
      const rowNum = index + 2; // Account for header row and 0-based index

      try {
        // Parse amount
        const amount = parseFloat(values[headerMap.amount]);
        if (isNaN(amount)) {
          invalidRows++;
          issues.push(`Row ${rowNum}: Invalid amount format`);
          return;
        }

        // Validate date
        const date = new Date(values[headerMap.payment_date]);
        if (isNaN(date.getTime())) {
          invalidRows++;
          issues.push(`Row ${rowNum}: Invalid date format`);
          return;
        }

        // Check required fields
        const requiredFields = ['payment_method', 'status', 'description', 'transaction_id', 'lease_id'];
        for (const field of requiredFields) {
          if (!values[headerMap[field as keyof typeof headerMap]]?.trim()) {
            invalidRows++;
            issues.push(`Row ${rowNum}: Missing ${field.replace('_', ' ')}`);
            return;
          }
        }

        validRows++;
        totalAmount += amount;
      } catch (error) {
        console.error(`Error processing row ${rowNum}:`, error);
        invalidRows++;
        issues.push(`Row ${rowNum}: Processing error - ${error.message}`);
      }
    });

    // Add suggestions based on analysis
    if (invalidRows > 0) {
      suggestions.push('Please correct the invalid entries before importing');
      suggestions.push('Ensure all amounts are valid numbers and dates are in YYYY-MM-DD format');
    }

    const result = {
      totalRows: rows.length,
      validRows,
      invalidRows,
      totalAmount,
      issues,
      suggestions,
    };

    console.log('Analysis completed:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
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