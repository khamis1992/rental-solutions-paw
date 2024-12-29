import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { fileName, fileContent } = await req.json();
    console.log('Processing file:', fileName);

    if (!fileContent) {
      throw new Error('No file content provided');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const lines = fileContent.split('\n');
    const headers = lines[0].toLowerCase().split(',').map((h: string) => h.trim());
    const requiredHeaders = [
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

    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    // Process data rows
    const dataRows = lines.slice(1).filter((line: string) => line.trim() !== '');
    const processedRows = [];

    for (const line of dataRows) {
      const values = line.split(',').map((v: string) => v.trim());
      const rowData: Record<string, any> = {};
      
      headers.forEach((header: string, index: number) => {
        rowData[header] = values[index];
      });

      // Convert amount to number
      rowData.amount = parseFloat(rowData.amount);
      
      // Format date
      rowData.payment_date = new Date(rowData.payment_date).toISOString();

      processedRows.push(rowData);
    }

    // Insert data into the database
    const { error: insertError } = await supabase
      .from('transaction_imports')
      .insert(processedRows);

    if (insertError) {
      console.error('Error inserting data:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ message: 'Import completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing import:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});