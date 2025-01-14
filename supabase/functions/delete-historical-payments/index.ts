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
    const { agreementId } = await req.json();

    if (!agreementId) {
      throw new Error('Agreement ID is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Delete all payments before 2025 from unified_payments for this agreement
    const { error: paymentsError } = await supabaseClient
      .from('unified_payments')
      .delete()
      .eq('lease_id', agreementId)
      .lt('payment_date', '2025-01-01');

    if (paymentsError) {
      console.error("Error deleting payments:", paymentsError);
      throw paymentsError;
    }

    // Update agreement's last payment date
    const { error: updateError } = await supabaseClient
      .from('leases')
      .update({
        last_payment_date: (
          await supabaseClient
            .from('unified_payments')
            .select('payment_date')
            .eq('lease_id', agreementId)
            .gte('payment_date', '2025-01-01')
            .order('payment_date', { ascending: false })
            .limit(1)
            .single()
        ).data?.payment_date || null
      })
      .eq('id', agreementId);

    if (updateError) {
      console.error("Error updating agreement payment date:", updateError);
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