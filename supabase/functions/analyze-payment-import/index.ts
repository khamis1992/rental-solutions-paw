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
  let data: Record<string, any> = {};
  
  try {
    // Basic data validation
    if (!row.amount || isNaN(parseFloat(row.amount))) {
      errors.push('Invalid amount format');
    } else {
      data.amount = parseFloat(row.amount);
    }

    if (row.payment_date) {
      const date = new Date(row.payment_date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid payment date format');
      } else {
        data.payment_date = date.toISOString();
      }
    }

    // Copy other fields directly
    headers.forEach(header => {
      if (header !== 'amount' && header !== 'payment_date') {
        data[header] = row[header] || null;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? data : undefined
    };
  } catch (error) {
    console.error('Row validation error:', error);
    return {
      isValid: false,
      errors: ['Row validation failed: ' + error.message]
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, headers, rows, importId } = await req.json();
    console.log('Starting analysis of payment import data:', { 
      totalRows: rows?.length,
      headers,
      importId 
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
        totalAmount += validation.data.amount || 0;
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
        validRows,
        invalidRows,
        totalAmount,
        suggestions,
        importId,
        errorSummary: {
          totalErrors: invalidRows.length,
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