import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './corsHeaders.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await req.json();

    if (error) {
      throw error;
    }

    if (!data.analysisResult?.rawData || !Array.isArray(data.analysisResult.rawData)) {
      throw new Error('Analysis result must contain rawData array');
    }

    // Process each payment record
    const results = await Promise.all(
      data.analysisResult.rawData.map(async (payment) => {
        try {
          const { error: insertError } = await supabaseClient
            .from('payments')
            .insert({
              lease_id: payment.lease_id,
              amount: parseFloat(payment.amount),
              payment_date: payment.payment_date,
              payment_method: payment.payment_method,
              status: payment.status || 'completed',
              description: payment.description,
              transaction_id: payment.transaction_id
            });

          if (insertError) throw insertError;
          return { success: true, payment };
        } catch (error) {
          console.error('Error processing payment:', error);
          return { success: false, payment, error: error.message };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const errors = results.filter(r => !r.success);

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Successfully processed ${successCount} payments with ${errors.length} errors`,
        processed: successCount,
        errors: errors.length > 0 ? errors : undefined
      }),
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