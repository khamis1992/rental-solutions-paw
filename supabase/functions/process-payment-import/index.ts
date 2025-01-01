import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './corsHeaders.ts';
import { validatePaymentData } from './validators.ts';

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

    // Process each payment record
    const rawData = requestData.analysisResult.rawData;
    let successCount = 0;
    const errors = [];

    for (const payment of rawData) {
      try {
        const { error: insertError } = await supabaseClient
          .from('payments')
          .insert({
            lease_id: payment.lease_id,
            amount: parseFloat(payment.amount),
            payment_date: new Date(payment.payment_date).toISOString(),
            payment_method: payment.payment_method.toLowerCase(),
            status: payment.status || 'completed',
            description: payment.description,
            transaction_id: payment.transaction_id
          });

        if (insertError) {
          console.error('Error inserting payment:', insertError);
          errors.push({
            payment,
            error: insertError.message
          });
        } else {
          successCount++;
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        errors.push({
          payment,
          error: error.message
        });
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