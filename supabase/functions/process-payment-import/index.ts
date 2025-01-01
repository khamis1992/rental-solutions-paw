import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './corsHeaders.ts';
import { validatePaymentData } from './validators.ts';
import { processPayments } from './paymentProcessor.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting payment import processing...');
    
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    // Validate the input data
    try {
      validatePaymentData(requestData);
    } catch (error: any) {
      console.error('Validation error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
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

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { successCount, errors } = await processPayments(
      supabaseClient, 
      requestData.analysisResult.rawData
    );

    // Track the import in financial_imports
    if (successCount > 0) {
      try {
        const { error: trackingError } = await supabaseClient
          .from('financial_imports')
          .insert(requestData.analysisResult.rawData.map((p: any) => ({
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