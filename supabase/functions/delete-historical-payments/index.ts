import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting delete historical payments process...");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Delete all payments before 2025 from unified_payments
    const { error: paymentsError } = await supabaseClient
      .from('unified_payments')
      .delete()
      .lt('payment_date', '2025-01-01');

    if (paymentsError) {
      console.error("Error deleting payments:", paymentsError);
      throw paymentsError;
    }

    // Update all agreements' last payment dates
    const { error: updateError } = await supabaseClient.rpc('update_agreement_payment_dates');

    if (updateError) {
      console.error("Error updating agreement payment dates:", updateError);
      throw updateError;
    }

    console.log("Successfully deleted historical payments");

    return new Response(
      JSON.stringify({ message: 'Historical payments deleted successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in delete-historical-payments function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to delete historical payments',
        details: error.stack,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});