import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

function validateRow(row: any, headers: string[]): ValidationResult {
  const errors: string[] = [];
  const expectedColumnCount = headers.length;
  
  // Check column count
  if (Object.keys(row).length !== expectedColumnCount) {
    errors.push(`Expected ${expectedColumnCount} columns but found ${Object.keys(row).length}`);
    return { isValid: false, errors };
  }

  // Validate amount format
  if (isNaN(parseFloat(row.amount))) {
    errors.push('Invalid amount format');
    return { isValid: false, errors };
  }

  // Validate date format
  const paymentDate = new Date(row.payment_date);
  if (isNaN(paymentDate.getTime())) {
    errors.push('Invalid payment date format');
    return { isValid: false, errors };
  }

  // Sanitize and transform data
  const sanitizedData = {
    amount: parseFloat(row.amount),
    payment_date: paymentDate.toISOString(),
    payment_method: row.payment_method || null,
    description: row.description || null,
    status: 'pending'
  };

  return {
    isValid: true,
    errors: [],
    sanitizedData
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, headers, rows } = await req.json();
    console.log('Starting analysis of payment import data:', { 
      totalRows: rows?.length,
      headers 
    });

    if (!Array.isArray(rows)) {
      throw new Error('Rows must be an array');
    }

    const validRows: any[] = [];
    const invalidRows: { row: number; errors: string[] }[] = [];
    let totalAmount = 0;

    // Process each row
    rows.forEach((row, index) => {
      const validation = validateRow(row, headers);
      
      if (validation.isValid && validation.sanitizedData) {
        validRows.push(validation.sanitizedData);
        totalAmount += validation.sanitizedData.amount;
      } else {
        invalidRows.push({
          row: index + 1,
          errors: validation.errors
        });
      }
    });

    // Generate suggestions based on common errors
    const suggestions = [];
    const columnErrors = invalidRows.filter(r => 
      r.errors.some(e => e.includes('columns'))
    ).length;
    const amountErrors = invalidRows.filter(r => 
      r.errors.some(e => e.includes('amount'))
    ).length;
    const dateErrors = invalidRows.filter(r => 
      r.errors.some(e => e.includes('date'))
    ).length;

    if (columnErrors > 0) {
      suggestions.push(`Fix ${columnErrors} rows with incorrect column counts`);
    }
    if (amountErrors > 0) {
      suggestions.push(`Correct ${amountErrors} rows with invalid amount formats`);
    }
    if (dateErrors > 0) {
      suggestions.push(`Update ${dateErrors} rows with invalid date formats`);
    }

    console.log('Analysis complete:', {
      totalRows: rows.length,
      validRows: validRows.length,
      invalidRows: invalidRows.length,
      totalAmount
    });

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: rows.length,
        validRows: validRows,
        invalidRows: invalidRows,
        totalAmount,
        suggestions,
        errorSummary: {
          columnErrors,
          amountErrors,
          dateErrors
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error analyzing payment import:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});