import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: Record<string, any>;
}

function validateRow(row: any, headers: string[]): ValidationResult {
  const errors: string[] = [];
  const expectedColumnCount = headers.length;
  
  // Check column count
  if (Object.keys(row).length !== expectedColumnCount) {
    errors.push(`Invalid number of columns`);
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

  // Return sanitized data
  return {
    isValid: true,
    errors: [],
    data: {
      amount: parseFloat(row.amount),
      payment_date: paymentDate.toISOString(),
      payment_method: row.payment_method || null,
      description: row.description || null,
      status: 'pending'
    }
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
      
      if (validation.isValid && validation.data) {
        validRows.push(validation.data);
        totalAmount += validation.data.amount;
      } else {
        invalidRows.push({
          row: index + 1,
          errors: validation.errors
        });
      }
    });

    // Generate suggestions based on common errors
    const suggestions = [];
    if (invalidRows.length > 0) {
      suggestions.push("Please review and correct the errors before proceeding");
      if (invalidRows.some(r => r.errors.includes('Invalid amount format'))) {
        suggestions.push("Ensure all amounts are valid numbers");
      }
      if (invalidRows.some(r => r.errors.includes('Invalid payment date format'))) {
        suggestions.push("Verify date formats are correct");
      }
    }

    console.log('Analysis complete:', {
      totalRows: rows.length,
      validRowsCount: validRows.length,
      invalidRowsCount: invalidRows.length,
      totalAmount
    });

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: rows.length,
        validRows: validRows, // Now this is an array of sanitized data
        invalidRows: invalidRows,
        totalAmount,
        suggestions,
        errorSummary: {
          totalErrors: invalidRows.length,
          columnErrors: invalidRows.filter(r => r.errors.includes('Invalid number of columns')).length,
          amountErrors: invalidRows.filter(r => r.errors.includes('Invalid amount format')).length,
          dateErrors: invalidRows.filter(r => r.errors.includes('Invalid payment date format')).length
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