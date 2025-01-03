import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get unprocessed payments
    const { data: unprocessedPayments, error: fetchError } = await supabase
      .from('raw_payment_imports')
      .select('*')
      .eq('is_valid', false);

    if (fetchError) throw fetchError;

    const results = [];
    const errors = [];

    for (const payment of unprocessedPayments || []) {
      try {
        // Check if agreement exists
        const { data: agreement } = await supabase
          .from('leases')
          .select('id')
          .eq('agreement_number', payment.Agreement_Number)
          .single();

        if (!agreement) {
          // Create agreement if it doesn't exist
          const { data: customer } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', payment.Customer_Name)
            .single();

          if (!customer) {
            // Create customer if they don't exist
            const { data: newCustomer, error: customerError } = await supabase
              .from('profiles')
              .insert({
                full_name: payment.Customer_Name,
                role: 'customer'
              })
              .select()
              .single();

            if (customerError) throw customerError;
            
            // Get first available vehicle
            const { data: vehicle } = await supabase
              .from('vehicles')
              .select('id')
              .eq('status', 'available')
              .limit(1)
              .single();

            if (!vehicle) throw new Error('No available vehicles');

            // Create new agreement
            const { data: newAgreement, error: agreementError } = await supabase
              .from('leases')
              .insert({
                agreement_number: payment.Agreement_Number,
                customer_id: newCustomer.id,
                vehicle_id: vehicle.id,
                total_amount: payment.Amount,
                status: 'active',
                agreement_type: 'short_term'
              })
              .select()
              .single();

            if (agreementError) throw agreementError;
          }
        }

        // Create payment
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            lease_id: agreement?.id,
            amount: payment.Amount,
            payment_method: payment.Payment_Method,
            payment_date: payment.Payment_Date,
            status: payment.Status,
            description: payment.Description
          });

        if (paymentError) throw paymentError;

        // Mark as processed
        const { error: updateError } = await supabase
          .from('raw_payment_imports')
          .update({ is_valid: true })
          .eq('id', payment.id);

        if (updateError) throw updateError;

        results.push({
          success: true,
          payment: payment.Transaction_ID
        });
      } catch (error) {
        console.error(`Error processing payment ${payment.Transaction_ID}:`, error);
        errors.push({
          payment: payment.Transaction_ID,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        errors: errors.length > 0 ? errors : undefined,
        results 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing payment import:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});