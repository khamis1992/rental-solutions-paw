import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentData {
  fileName: string;
  fileContent: string;
  headers: string[];
  totalRows: number;
}

interface AnalysisResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  issues: string[];
  suggestions: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData: PaymentData = await req.json();
    console.log('Received request data:', {
      fileName: requestData.fileName,
      totalRows: requestData.totalRows,
      headerCount: requestData.headers?.length
    });

    if (!requestData || !requestData.headers || !requestData.fileContent) {
      throw new Error('Invalid request data structure');
    }

    // Validate headers
    const requiredHeaders = [
      'Transaction_ID',
      'Agreement_Number',
      'Customer_Name',
      'License_Plate',
      'Amount',
      'Payment_Method',
      'Description',
      'Payment_Date',
      'Type',
      'Status'
    ];

    const missingHeaders = requiredHeaders.filter(
      header => !requestData.headers.includes(header)
    );

    if (missingHeaders.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          issues: [`Missing required headers: ${missingHeaders.join(', ')}`]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Parse and validate rows
    const rows = requestData.fileContent.split('\n')
      .slice(1) // Skip header row
      .filter(row => row.trim().length > 0)
      .map(row => {
        const values = row.split(',');
        const rowData: Record<string, string> = {};
        requestData.headers.forEach((header, index) => {
          rowData[header] = values[index]?.trim() || '';
        });
        return rowData;
      });

    let validRows = 0;
    let totalAmount = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Validate each row
    rows.forEach((row, index) => {
      const rowNumber = index + 2; // Account for header row and 0-based index
      let isValid = true;

      // Validate Transaction ID
      if (!row.Transaction_ID) {
        issues.push(`Row ${rowNumber}: Missing Transaction ID`);
        isValid = false;
      }

      // Validate Amount
      const amount = parseFloat(row.Amount);
      if (isNaN(amount) || amount <= 0) {
        issues.push(`Row ${rowNumber}: Invalid amount`);
        isValid = false;
      } else {
        totalAmount += amount;
      }

      // Validate Payment Date
      const paymentDate = new Date(row.Payment_Date);
      if (isNaN(paymentDate.getTime())) {
        issues.push(`Row ${rowNumber}: Invalid payment date`);
        isValid = false;
      }

      // Validate Agreement Number
      if (!row.Agreement_Number) {
        issues.push(`Row ${rowNumber}: Missing Agreement Number`);
        suggestions.push(`Consider linking row ${rowNumber} to an existing agreement`);
        isValid = false;
      }

      if (isValid) {
        validRows++;
      }
    });

    const analysisResult: AnalysisResult = {
      success: issues.length === 0,
      totalRows: rows.length,
      validRows,
      invalidRows: rows.length - validRows,
      totalAmount,
      issues,
      suggestions: suggestions.length > 0 ? suggestions : ['All rows appear valid']
    };

    console.log('Analysis completed:', analysisResult);

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in analyze-payment-import:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});