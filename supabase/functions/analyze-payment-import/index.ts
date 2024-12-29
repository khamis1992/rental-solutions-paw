import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, headers, rows } = await req.json();
    console.log('Analyzing payment import with payload:', { headers, totalRows: rows?.length });

    // Validate the input data
    if (!Array.isArray(rows)) {
      throw new Error('Rows must be an array');
    }

    const validRows = [];
    const errors = [];
    let totalAmount = 0;

    // Process each row
    rows.forEach((row, index) => {
      try {
        // Basic validation
        if (!row.amount || isNaN(parseFloat(row.amount))) {
          errors.push(`Row ${index + 1}: Invalid amount format`);
          return;
        }

        // Add to valid rows with proper type conversion
        validRows.push({
          amount: parseFloat(row.amount),
          payment_date: row.payment_date || null,
          payment_method: row.payment_method || null,
          description: row.description || null,
          status: 'pending'
        });

        totalAmount += parseFloat(row.amount);
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: rows.length,
        validRows: validRows,
        invalidRows: errors.length,
        totalAmount,
        errors,
        suggestions: [
          "Please review and correct the errors before proceeding",
          "Ensure all amounts are valid numbers",
          "Verify date formats are correct"
        ]
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