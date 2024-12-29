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
    const { fileContent, headers, totalRows } = await req.json();
    console.log('Analyzing file content with headers:', headers);

    const lines = fileContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Basic validation of required fields
    const requiredFields = [
      'Agreement_Number',
      'License_Plate',
      'Rent_Amount',
      'Final_Price',
      'Amount_Paid',
      'Remaining_Amount',
      'Agreement_Duration'
    ];

    const missingFields = requiredFields.filter(field => 
      !headers.some(h => h.toLowerCase() === field.toLowerCase())
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

    // Process the rows to create structured data
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      return row;
    });

    return new Response(
      JSON.stringify({
        totalRows: rows.length,
        rows: rows,
        headers: headers,
        suggestions: rows.length > 0 ? ['Ready to import data'] : ['No valid rows found to import'],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});