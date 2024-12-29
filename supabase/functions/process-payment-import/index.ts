import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { analysisResult } = await req.json();
    console.log('Received analysis result:', analysisResult);

    // Validate that rows exist and is an array
    if (!analysisResult?.rows || !Array.isArray(analysisResult.rows)) {
      console.error('Invalid data format:', analysisResult);
      throw new Error('Valid rows must be an array');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Format the rows data properly
    const formattedRows = analysisResult.rows.map((row: any) => {
      // Convert and validate numeric fields
      const rentAmount = typeof row.rent_amount === 'string' ? parseFloat(row.rent_amount) : row.rent_amount;
      const finalPrice = typeof row.final_price === 'string' ? parseFloat(row.final_price) : row.final_price;
      const amountPaid = typeof row.amount_paid === 'string' ? parseFloat(row.amount_paid) : row.amount_paid;
      const remainingAmount = typeof row.remaining_amount === 'string' ? parseFloat(row.remaining_amount) : row.remaining_amount;

      if (isNaN(rentAmount) || isNaN(finalPrice) || isNaN(amountPaid) || isNaN(remainingAmount)) {
        throw new Error('Invalid numeric values in the data');
      }

      return {
        agreement_number: String(row.agreement_number || '').trim(),
        license_plate: String(row.license_plate || '').trim(),
        rent_amount: rentAmount,
        final_price: finalPrice,
        amount_paid: amountPaid,
        remaining_amount: remainingAmount,
        agreement_duration: row.agreement_duration || null,
        import_status: 'pending'
      };
    });

    console.log('Formatted rows for import:', formattedRows);

    if (formattedRows.length === 0) {
      throw new Error('No valid rows to import');
    }

    // Process the rows in batches of 100
    const batchSize = 100;
    const results = [];
    const errors = [];

    for (let i = 0; i < formattedRows.length; i += batchSize) {
      const batch = formattedRows.slice(i, i + batchSize);
      try {
        const { data, error } = await supabaseClient
          .from('remaining_amounts')
          .insert(batch)
          .select();

        if (error) {
          console.error('Batch insert error:', error);
          errors.push({
            batch: Math.floor(i / batchSize) + 1,
            error: error.message
          });
        } else {
          results.push(...(data || []));
        }
      } catch (batchError) {
        console.error('Batch processing error:', batchError);
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: batchError.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing payment import:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during processing',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});