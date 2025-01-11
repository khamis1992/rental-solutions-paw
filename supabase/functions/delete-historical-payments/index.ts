import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
};

export const handler = async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete all payments before 2025
    const { error: paymentsError } = await supabaseAdmin
      .from('payments')
      .delete()
      .lt('payment_date', '2025-01-01');

    if (paymentsError) throw paymentsError;

    // Delete all payment history records before 2025
    const { error: historyError } = await supabaseAdmin
      .from('payment_history')
      .delete()
      .lt('actual_payment_date', '2025-01-01');

    if (historyError) throw historyError;

    // Update all agreements' last payment dates
    const { error: updateError } = await supabaseAdmin.rpc('update_agreement_payment_dates');

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ message: 'Historical payments deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error deleting historical payments:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete historical payments' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
};