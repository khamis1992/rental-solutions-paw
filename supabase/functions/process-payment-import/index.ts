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
    console.log('Starting payment import processing...');
    
    const { analysisResult } = await req.json();
    
    if (!analysisResult) {
      console.error('Missing analysis result');
      throw new Error('Missing analysis result');
    }

    console.log('Analysis result received:', analysisResult);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate that we have valid rows to process
    if (!analysisResult.validRows || typeof analysisResult.validRows !== 'number' || analysisResult.validRows === 0) {
      console.log('No valid rows found in analysis result');
      return new Response(
        JSON.stringify({
          success: false,
          message: "No valid rows to process",
          processed: 0
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        }
      );
    }

    // Extract valid rows from the raw data
    const validRows = analysisResult.rawData?.filter((row: any) => !row.error) || [];
    console.log(`Processing ${validRows.length} valid rows...`);

    if (validRows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No valid rows found in the data",
          processed: 0
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        }
      );
    }

    // Process each valid row
    const payments = validRows.map((row: any) => ({
      lease_id: row.lease_id,
      amount: parseFloat(row.amount),
      payment_date: new Date(row.payment_date).toISOString(),
      payment_method: row.payment_method,
      status: 'completed',
      description: row.description,
      transaction_id: row.transaction_id
    }));

    console.log('Prepared payments for insertion:', payments);

    // Insert payments in batches
    const batchSize = 50;
    const errors = [];
    let successCount = 0;

    for (let i = 0; i < payments.length; i += batchSize) {
      const batch = payments.slice(i, Math.min(i + batchSize, payments.length));
      
      try {
        console.log(`Processing batch ${i/batchSize + 1}:`, batch);
        
        const { data, error: insertError } = await supabaseClient
          .from('payments')
          .insert(batch)
          .select();

        if (insertError) {
          console.error('Batch insert error:', insertError);
          errors.push({
            batch: i/batchSize + 1,
            error: insertError.message
          });
        } else {
          console.log(`Successfully inserted ${data?.length} payments`);
          successCount += data?.length || 0;
        }
      } catch (error) {
        console.error(`Error processing batch ${i + 1}-${i + batch.length}:`, error);
        errors.push({
          batch: i/batchSize + 1,
          error: error.message
        });
      }
    }

    // Also insert into financial_imports for tracking
    if (successCount > 0) {
      try {
        const { error: trackingError } = await supabaseClient
          .from('financial_imports')
          .insert(payments.map(p => ({
            lease_id: p.lease_id,
            amount: p.amount,
            payment_date: p.payment_date,
            payment_method: p.payment_method,
            transaction_id: p.transaction_id,
            description: p.description,
            type: 'payment',
            status: 'completed'
          })));

        if (trackingError) {
          console.error('Error tracking imports:', trackingError);
        }
      } catch (error) {
        console.error('Error inserting into financial_imports:', error);
      }
    }

    const result = {
      success: successCount > 0,
      message: `Successfully processed ${successCount} payments with ${errors.length} errors`,
      processed: successCount,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('Import processing completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error processing import:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});