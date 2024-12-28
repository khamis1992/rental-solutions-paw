import { serve } from 'https://deno.fresh.dev/std@v9.6.2/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const { agreementNumber, paymentDate } = await req.json();

    if (!agreementNumber || !paymentDate) {
      console.error('Missing required parameters:', { agreementNumber, paymentDate });
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters',
          details: { agreementNumber, paymentDate }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Verifying customer for:', { agreementNumber, paymentDate });

    const { data: agreements, error: agreementError } = await supabaseClient
      .from('leases')
      .select(`
        id,
        customer_id,
        start_date,
        end_date,
        status,
        profiles:customer_id (
          full_name
        )
      `)
      .eq('agreement_number', agreementNumber)
      .single();

    if (agreementError) {
      console.error('Error fetching agreement:', agreementError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch agreement details',
          details: agreementError
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (!agreements) {
      console.log('No agreement found for:', agreementNumber);
      return new Response(
        JSON.stringify({
          data: {
            customerName: 'Unknown',
            isValidDate: false,
            message: `No active agreement found for number ${agreementNumber}`
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const agreement = agreements;
    const paymentDateObj = new Date(paymentDate);
    const startDate = new Date(agreement.start_date);
    const endDate = agreement.end_date ? new Date(agreement.end_date) : null;

    const isValidDate = paymentDateObj >= startDate && 
      (!endDate || paymentDateObj <= endDate);

    console.log('Validation result:', {
      customerName: agreement.profiles?.full_name || 'Unknown',
      isValidDate,
      agreement: agreement
    });

    return new Response(
      JSON.stringify({
        data: {
          customerName: agreement.profiles?.full_name || 'Unknown',
          isValidDate,
          message: isValidDate ? 
            'Payment date is within agreement period' : 
            'Payment date is outside agreement period'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});